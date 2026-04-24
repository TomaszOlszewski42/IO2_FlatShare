using FlatShareBackend.Dtos.Listings;

namespace FlatShareBackend.Dtos.Matches;

public class PagedMatchedListingsDto
{
    public required IEnumerable<MatchedListingDto> Content { get; set; }
    public required SearchPage Page { get; set; }
}
