using FlatShareBackend.Application.Dtos;
using FlatShareBackend.Application.Services.Auth;
using FlatShareBackend.Application.Services.Bookings;
using FlatShareBackend.Dtos.Reports;
using FlatShareBackend.Infrastructure.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlatShareBackend.API.Controllers;

[ApiController]
[Route("api/v1/payments")]
public class PaymentsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public PaymentsController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [HttpGet("{paymentId}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid paymentId)
    {
        return Ok(await _bookingService.GetPaymentByPaymentId(paymentId));
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetByBookingId([FromQuery] Guid bookingId)
    {
        return Ok(await _bookingService.GetPaymentByBookingId(bookingId));
    }
}
