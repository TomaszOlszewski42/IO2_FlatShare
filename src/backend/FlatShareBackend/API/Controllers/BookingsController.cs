using FlatShareBackend.Application.Dtos.Bookings;
using FlatShareBackend.Application.Services.Bookings;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Infrastructure.Extensions;
using Microsoft.AspNetCore.Mvc;

namespace FlatShareBackend.API.Controllers;

[ApiController]
[Route("api/v1/rentals")]
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
    public async Task<IActionResult> Create([FromBody] BookingRequest rentalRequest)
    {
        var requesterId = _httpAccessor.ParseUserID();
        var bookingId = _bookingService.CreateBooking(rentalRequest, requesterId);
        return Ok(bookingId); // TODO: zwracać poprawny obiekt
    }

    [HttpPost("{rentalId}/accept")]
    public async Task<IActionResult> Accept(Guid rentalId)
    {
        await _bookingService.ChangeStatus(rentalId, BookingStatus.PendingPayment);
        return Ok();
    }

    [HttpPost("{rentalId}/reject")]
    public async Task<IActionResult> Reject(Guid rentalId)
    {
        await _bookingService.ChangeStatus(rentalId, BookingStatus.Rejected);
        return Ok();
    }

    [HttpPost("{rentalId}/cancel")]
    public async Task<IActionResult> Cancel(Guid rentalId)
    {
        await _bookingService.ChangeStatus(rentalId, BookingStatus.Cancelled);
        return Ok();
    }

    [HttpPost("{rentalId}/pay")]
    public async Task<IActionResult> Pay(Guid rentalId)
    {
        await _bookingService.ChangeStatus(rentalId, BookingStatus.Confirmed);
        return Ok();
    }


    [HttpGet("{rentalId}")]
    public async Task<IActionResult> GetStatus(Guid rentalId)
    {
        var status = await _bookingService.GetStatus(rentalId);
        return Ok(status);
    }
}
