using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Services.Payments;

public record PayForRentalResult(Guid PaymentId, PaymentStatus Status, string CheckoutUrl);

public interface IPaymentService
{
    Task<PayForRentalResult> PayForRentalAsync(Guid bookingId, Guid currentUserId, CancellationToken ct = default);
    Task HandleWebhookAsync(string json, string signature, CancellationToken ct = default);
}
