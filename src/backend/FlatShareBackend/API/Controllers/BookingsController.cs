using FlatShareBackend.Application.Dtos.Bookings;
using FlatShareBackend.Application.Services.Bookings;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Infrastructure.Extensions;
using Microsoft.AspNetCore.Mvc;

namespace FlatShareBackend.API.Controllers;

[ApiController]
[Route("api/v1/bookings")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;
    private readonly IHttpContextAccessor _httpAccessor;

    public BookingsController(IBookingService bookingService, IHttpContextAccessor httpAccessor)
    {
        _bookingService = bookingService;
        _httpAccessor = httpAccessor;
    }

    [HttpPost()]
    public async Task<IActionResult> Create([FromBody] BookingRequest bookingRequest)
    {
        var requesterId = _httpAccessor.ParseUserID();
        var booking = await _bookingService.CreateBooking(bookingRequest, requesterId);
        return Created($"api/v1/bookings/{booking.Id}", booking);
    }

    [HttpPost("{bookingId}/accept")]
    public async Task<IActionResult> Accept(Guid bookingId)
    {
        await _bookingService.ChangeStatus(bookingId, BookingStatus.PendingPayment);
        return Ok();
    }

    [HttpPost("{bookingId}/reject")]
    public async Task<IActionResult> Reject(Guid bookingId)
    {
        await _bookingService.ChangeStatus(bookingId, BookingStatus.Rejected);
        return Ok();
    }

    [HttpPost("{bookingId}/cancel")]
    public async Task<IActionResult> Cancel(Guid bookingId)
    {
        await _bookingService.ChangeStatus(bookingId, BookingStatus.Cancelled);
        return Ok();
    }

    [HttpPost("{bookingId}/pay")]
    public async Task<IActionResult> Pay(Guid bookingId)
    {
        await _bookingService.ChangeStatus(bookingId, BookingStatus.Confirmed);
        return Ok();
    }

    [HttpGet("{bookingId}")]
    public async Task<IActionResult> GetStatus(Guid bookingId)
    {
        var status = await _bookingService.GetStatus(bookingId);
        return Ok(status);
    }
}
