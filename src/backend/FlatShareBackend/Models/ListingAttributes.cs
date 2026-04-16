namespace FlatShareBackend.Models;

public class ListingAttributes
{
    public required bool PetsAllowed { get; set; }
    public required bool NonSmokingOnly { get; set; }
    public required bool CloseToShops { get; set; }
    public required string Profile { get; set; } // TODO: może enum byłby lepszy?
}
