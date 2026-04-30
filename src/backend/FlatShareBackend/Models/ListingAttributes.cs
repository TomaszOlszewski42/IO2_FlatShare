using FlatShareBackend.AgregationClasses;

namespace FlatShareBackend.Models;

public class ListingAttributes
{
    public required bool PetsAllowed { get; set; }
    public required bool NonSmokingOnly { get; set; }
    public required bool CloseToShops { get; set; }
    public required UserProfile Profile { get; set; }
}
