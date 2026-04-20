using FlatShareBackend.Dtos.Listings;

namespace FlatShareBackend.Dtos.Matches;

public class PagedListingsDtos
{
    public required IEnumerable<ListingDto> Content { get; set; }
    public required SearchPage Page { get; set; }
}
