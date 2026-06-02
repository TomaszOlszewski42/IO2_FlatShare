using FlatShareBackend.API.Options;
using FlatShareBackend.Application.Ports;
using FlatShareBackend.Domain.Exceptions;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Stripe;

namespace FlatShareBackend.Application.Services.Payments;

public class PaymentService : IPaymentService
{
    private readonly AppDbContext _dbContext;
    private readonly IPaymentGateway _paymentGateway;
    private readonly StripeOptions _stripeOptions;

    public PaymentService(AppDbContext dbContext, IPaymentGateway paymentGateway, IOptions<StripeOptions> stripeOptions)
    {
        _dbContext = dbContext;
        _paymentGateway = paymentGateway;
        _stripeOptions = stripeOptions.Value;
    }

    public async Task<PayForRentalResult> PayForRentalAsync(Guid bookingId, Guid currentUserId, CancellationToken ct = default)
    {
        var booking = await _dbContext.Bookings
            .Include(b => b.Payment)
            .FirstOrDefaultAsync(b => b.Id == bookingId, ct)
            ?? throw new InvalidIdException("Booking not found");

        if (booking.TenantId != currentUserId)
            throw new UnauthorizedAccessException("You are not a tenant of this booking");

        if (booking.Status != BookingStatus.PendingPayment)
            throw new InvalidOperationException("Booking is not in a valid state for payment");

        // Amount calculation
        var amount = booking.TotalCost; // Already calculated by booking logic
        var currency = booking.Currency;

        var paymentId = Guid.NewGuid();
        var payment = new Payment
        {
            Id = paymentId,
            BookingId = bookingId,
            Amount = amount,
            Currency = currency,
            Status = PaymentStatus.Initiated,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        booking.Payment = payment;
        _dbContext.Payments.Add(payment);

        var command = new CreateCheckoutSessionCommand(bookingId, paymentId, currentUserId, amount, currency);
        var result = await _paymentGateway.CreateCheckoutSessionAsync(command, ct);

        payment.ProviderSessionId = result.SessionId;
        payment.Status = PaymentStatus.Redirected;
        payment.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync(ct);

        return new PayForRentalResult(paymentId, payment.Status, result.CheckoutUrl);
    }

    public async Task HandleWebhookAsync(string json, string signature, CancellationToken ct = default)
    {
        Event stripeEvent;
        try
        {
            stripeEvent = EventUtility.ConstructEvent(
                json,
                signature,
                _stripeOptions.WebhookSecret,
                throwOnApiVersionMismatch: false
            );
        }
        catch (StripeException e)
        {
            throw new InvalidOperationException($"Webhook error: {e.Message}");
        }

        if (stripeEvent.Type == "checkout.session.completed")
        {
            var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
            if (session == null) return;

            var payment = await _dbContext.Payments
                .FirstOrDefaultAsync(p => p.ProviderSessionId == session.Id, ct);

            if (payment == null) return;

            if (payment.Status == PaymentStatus.Succeeded) return;

            payment.Status = PaymentStatus.Succeeded;
            payment.ProviderPaymentIntentId = session.PaymentIntentId;
            payment.UpdatedAt = DateTime.UtcNow;

            var booking = await _dbContext.Bookings.FindAsync(new object[] { payment.BookingId }, ct);
            if (booking != null)
            {
                booking.Status = BookingStatus.Confirmed;
            }

            await _dbContext.SaveChangesAsync(ct);
        }
        else if (stripeEvent.Type == "checkout.session.expired")
        {
            var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
            if (session == null) return;

            var payment = await _dbContext.Payments
                .FirstOrDefaultAsync(p => p.ProviderSessionId == session.Id, ct);

            if (payment == null) return;

            payment.Status = PaymentStatus.Cancelled;
            payment.UpdatedAt = DateTime.UtcNow;

            var booking = await _dbContext.Bookings.FindAsync(new object[] { payment.BookingId }, ct);
            if (booking != null)
            {
                booking.Status = BookingStatus.PaymentFailed;
            }

            await _dbContext.SaveChangesAsync(ct);
        }
        else if (stripeEvent.Type == "checkout.session.async_payment_failed")
        {
            var session = stripeEvent.Data.Object as Stripe.Checkout.Session;
            if (session == null) return;

            var payment = await _dbContext.Payments
                .FirstOrDefaultAsync(p => p.ProviderSessionId == session.Id, ct);

            if (payment == null) return;

            payment.Status = PaymentStatus.Failed;
            payment.UpdatedAt = DateTime.UtcNow;

            var booking = await _dbContext.Bookings.FindAsync(new object[] { payment.BookingId }, ct);
            if (booking != null)
            {
                booking.Status = BookingStatus.PaymentFailed;
            }

            await _dbContext.SaveChangesAsync(ct);
        }
    }
}
