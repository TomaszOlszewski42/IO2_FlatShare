using FlatShareBackend.Application.Dtos;
using FlatShareBackend.Application.Services.Auth;
using FlatShareBackend.Application.Services.Bookings;
using FlatShareBackend.Application.Services.Payments;
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
    private readonly IHttpContextAccessor _accessor;
    private readonly IPaymentService _paymentService;

    public PaymentsController(IBookingService bookingService, IHttpContextAccessor accessor, IPaymentService paymentService)
    {
        _bookingService = bookingService;
        _accessor = accessor;
        _paymentService = paymentService;
    }

    [HttpGet("{paymentId}")]
    [Authorize(Roles = "ADMIN, TENANT")]
    public async Task<IActionResult> GetById(Guid paymentId)
    {
        return Ok(await _bookingService.GetPaymentByPaymentId(paymentId, _accessor.ParseUserID(), _accessor.ParserUserRole()));
    }

    [HttpGet]
    [Authorize(Roles = "ADMIN, TENANT")]
    public async Task<IActionResult> GetByBookingId([FromQuery] Guid bookingId)
    {
        return Ok(await _bookingService.GetPaymentByBookingId(bookingId, _accessor.ParseUserID(), _accessor.ParserUserRole()));
    }

    [HttpPost("stripe/webhook")]
    public async Task<IActionResult> StripeWebhook()
    {
        using var reader = new StreamReader(Request.Body);
        var json = await reader.ReadToEndAsync();
        var signatureHeader = Request.Headers["Stripe-Signature"].ToString();

        await _paymentService.HandleWebhookAsync(json, signatureHeader);

        return Ok();
    }

    [HttpPost("confirm")]
    [Authorize(Roles = "TENANT")]
    public async Task<IActionResult> ConfirmPayment([FromQuery] string sessionId)
    {
        var result = await _paymentService.ConfirmPaymentBySessionIdAsync(sessionId);
        return Ok(new
        {
            paymentId = result.PaymentId,
            status = result.Status.ToString(),
            bookingId = result.BookingId
        });
    }
}
