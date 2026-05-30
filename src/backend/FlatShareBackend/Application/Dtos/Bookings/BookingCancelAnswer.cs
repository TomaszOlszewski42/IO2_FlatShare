using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.API.Controllers;

public class BookingCancelAnswer
{
    public required Guid BookingId { get; set; }
    public required BookingStatus Status { get; set; }
    public required DateTime CancelledAt { get; set; }
    public required string RefundStatus { get; set; }
}
