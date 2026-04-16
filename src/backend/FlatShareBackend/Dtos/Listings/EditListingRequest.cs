using FlatShareBackend.Models;
namespace FlatShareBackend.Dtos.Listings;

public record EditListingRequest
{
    public string? Title { get; init; }
    public string? Description { get; init; }
    public decimal? Price { get; init; }
    public string? Currency { get; init; }
    public DateOnly? AvailableFrom { get; init; }
    public string? OwnerContact { get; init; }
    public decimal? Area { get; init; }
    public DateOnly? AvailableSince { get; init; } // Strasznie dziwna nazwa, brzmi na potencjalny błąd
    public Address? Location { get; init; }
    public List<DateRange>? UnavailableDates { get; init; }
    public ListingAttributes? Attributes { get; init; }
}