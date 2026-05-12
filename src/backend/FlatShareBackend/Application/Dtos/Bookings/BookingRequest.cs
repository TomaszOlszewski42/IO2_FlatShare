namespace FlatShareBackend.Application.Dtos.Bookings;

public record BookingRequest
{
    public required Guid ListingId;
    public required DateOnly StartDate;
    public required DateOnly EndDate;
}
