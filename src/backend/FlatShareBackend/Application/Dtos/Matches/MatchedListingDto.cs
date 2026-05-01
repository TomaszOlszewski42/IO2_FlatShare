using FlatShareBackend.Application.Dtos.Listings;

namespace FlatShareBackend.Application.Dtos.Matches;

public class MatchedListingDto
{
    public required ListingDto Listing { get; set; }
    public required float MatchScore { get; set; }
}