using FlatShareBackend.Models;

namespace FlatShareBackend.Dtos.Listings;

public record CreateListingRequest
{
    public required string Title { get; init; }
    public required string Description { get; init; }
    public required decimal Price { get; init; }
    public required string Currency { get; init; }
    public required DateOnly AvailableFrom { get; init; }
    public required string OwnerContact { get; init; }
    public required decimal Area { get; init; }
    public required DateOnly AvailableSince { get; init; } // Strasznie dziwna nazwa, brzmi na potencjalny błąd
    public required Address Location { get; init; }
    public required ListingAttributes Attributes { get; init; }
}
