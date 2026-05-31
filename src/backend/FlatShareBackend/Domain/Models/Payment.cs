namespace FlatShareBackend.Domain.Models;

public class Payment
{
    public required Guid Id { get; set; }
    public required Guid BookingId { get; set; }
    public required PaymentStatus Status { get; set; }
    public required decimal Amount { get; set; }
    public required string Currency { get; set; }
    public string Provider { get; set; } = "STRIPE";
    public string? ProviderSessionId { get; set; }
    public string? ProviderPaymentIntentId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}