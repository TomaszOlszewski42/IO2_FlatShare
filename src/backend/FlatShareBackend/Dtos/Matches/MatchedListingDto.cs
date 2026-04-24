using FlatShareBackend.Dtos.Listings;

namespace FlatShareBackend.Dtos.Matches;

public class MatchedListingDto
{
    public required ListingDto Listing { get; set; }
    public required float MatchScore { get; set; }
}