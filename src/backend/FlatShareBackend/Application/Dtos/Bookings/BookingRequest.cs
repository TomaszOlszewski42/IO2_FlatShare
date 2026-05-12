namespace FlatShareBackend.Application.Dtos.Bookings;

public record BookingRequest
{
    public required Guid ListingId { get; set; }
    public required DateOnly StartDate { get; set; }
    public required DateOnly EndDate { get; set; }
}
