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
    private readonly Guid _requesterId;
    private readonly string _role;

    public PaymentsController(IBookingService bookingService, IHttpContextAccessor accessor)
    {
        _bookingService = bookingService;
        _requesterId = accessor.ParseUserID();
        _role = accessor.ParserUserRole();
    }

    [HttpGet("{paymentId}")]
    [Authorize(Roles = "ADMIN, TENANT")]
    public async Task<IActionResult> GetById(Guid paymentId)
    {
        return Ok(await _bookingService.GetPaymentByPaymentId(paymentId, _requesterId, _role));
    }

    [HttpGet]
    [Authorize(Roles = "ADMIN, TENANT")]
    public async Task<IActionResult> GetByBookingId([FromQuery] Guid bookingId)
    {
        return Ok(await _bookingService.GetPaymentByBookingId(bookingId, _requesterId, _role));
    }
}
