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
    public required Guid Id;
    public required Guid TenantId;
    public required Guid ListingId;
    public required BookingStatus Status;
}