using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Dtos.Bookings;

public class BookingRejectionAnswer
{
    public required Guid BookingId { get; set; }
    public required BookingStatus Status { get; set; }
    public required DateTime RejectedAt { get; set; }
    public required string Reason { get; set; }
}
