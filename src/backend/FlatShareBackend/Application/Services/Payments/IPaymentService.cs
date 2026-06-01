using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Services.Payments;

public record PayForRentalResult(Guid PaymentId, PaymentStatus Status, string CheckoutUrl);
public record ConfirmPaymentResult(Guid PaymentId, PaymentStatus Status, Guid BookingId);

public interface IPaymentService
{
    Task<PayForRentalResult> PayForRentalAsync(Guid bookingId, Guid currentUserId, CancellationToken ct = default);
    Task HandleWebhookAsync(string json, string signature, CancellationToken ct = default);
    Task<ConfirmPaymentResult> ConfirmPaymentBySessionIdAsync(string sessionId, CancellationToken ct = default);
}
