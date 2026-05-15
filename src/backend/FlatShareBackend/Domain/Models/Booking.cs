namespace FlatShareBackend.Domain.Models;

public enum BookingStatus
{
    PendingApproval,
    Expired,
    Rejected,
    Confirmed,
    PaymentFailed,
    PendingPayment,
    Cancelled
}

public class Booking
{
    public required Guid Id { get; set; }
    public required Guid TenantId { get; set; }
    public required Guid ListingId { get; set; }
    public required BookingStatus Status { get; set; }
    public required DateOnly Since { get; set; }
    public required DateOnly Until { get; set; }
}