using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Dtos.Bookings;

public class BookingPayAnswer
{
    public required Guid PaymentId { get; set; }
    public required Guid BookingId { get; set; }
    public required PaymentStatus Status { get; set; }
    public required string RedirectUrl { get; set; }
    public required decimal Amount { get; set; }
    public required string Currency { get; set; }
}