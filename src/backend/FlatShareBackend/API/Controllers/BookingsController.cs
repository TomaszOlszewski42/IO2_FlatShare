using System.Security.Claims;
using FlatShareBackend.Application.Dtos.Bookings;
using FlatShareBackend.Application.Services.Bookings;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Infrastructure.Extensions;
using Microsoft.AspNetCore.Authorization;
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

    public record BookingCreatedResponse(Guid BookingId, BookingStatus Status, DateTime CreatedAt, decimal TotalPrice,
        string Currency, string ResourceLink);

    [Authorize(Roles = "TENANT")]
    [HttpPost()]
    public async Task<IActionResult> Create([FromBody] BookingRequest bookingRequest)
    {
        var requesterId = _httpAccessor.ParseUserID();
        var booking = await _bookingService.CreateBooking(bookingRequest, requesterId);
        var createdResourceLink = $"api/v1/bookings/{booking.Id}";
        // DateTime provider?
        var answer = new BookingCreatedResponse(booking.Id, booking.Status, DateTime.Now, booking.TotalCost, 
            booking.Currency, createdResourceLink);
        return Created(createdResourceLink, answer);
    }

    [Authorize(Roles = "LANDLORD")]
    [HttpPost("{bookingId}/accept")]
    public async Task<IActionResult> Accept(Guid bookingId)
    {
        var landlordId = _httpAccessor.ParseUserID();
        await _bookingService.ChangeStatusByLandlord(bookingId, BookingStatus.PendingPayment, landlordId);
        return Ok();
    }

    [Authorize(Roles = "LANDLORD")]
    [HttpPost("{bookingId}/reject")]
    public async Task<IActionResult> Reject(Guid bookingId)
    {
        var landlordId = _httpAccessor.ParseUserID();
        await _bookingService.ChangeStatusByLandlord(bookingId, BookingStatus.Rejected, landlordId);
        return Ok();
    }

    [Authorize(Roles = "TENANT")]
    [HttpPost("{bookingId}/cancel")]
    public async Task<IActionResult> Cancel(Guid bookingId)
    {
        var tenantId = _httpAccessor.ParseUserID();
        await _bookingService.ChangeStatusByTenant(bookingId, BookingStatus.Cancelled, tenantId);
        return Ok();
    }

    [Authorize(Roles = "TENANT")]
    [HttpPost("{bookingId}/pay")]
    public async Task<IActionResult> Pay(Guid bookingId)
    {
        var tenantId = _httpAccessor.ParseUserID();
        await _bookingService.ChangeStatusByTenant(bookingId, BookingStatus.Confirmed, tenantId);
        return Ok();
    }

    [Authorize()]
    [HttpGet("{bookingId}")]
    public async Task<IActionResult> Get(Guid bookingId)
    {
        var status = await _bookingService.Get(bookingId);
        return Ok(status);
    }

    [Authorize(Roles = "TENANT, LANDLORD")]
    [HttpGet("me")]
    public async Task<IActionResult> Mine()
    {
        var context = _httpAccessor.HttpContext ?? throw new ArgumentNullException("HttpContext is null!");
        var role = (context.User.FindFirst(ClaimTypes.Role) 
            ?? throw new ArgumentNullException("No role in Token")).Value;
        var requesterId = _httpAccessor.ParseUserID();
        var bookings = await _bookingService.GetAllOfUser(requesterId, role);
        return Ok(bookings);
    }
}
