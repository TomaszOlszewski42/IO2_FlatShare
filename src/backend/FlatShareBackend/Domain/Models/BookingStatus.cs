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
