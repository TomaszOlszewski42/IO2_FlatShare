using FlatShareBackend.Models;

namespace FlatShareBackend.Dtos.Listings;

public class ListingDto
{
    public ListingDto(Listing listing)
    {
        Id = listing.Id;
        Title = listing.Title;
        Description = listing.Description;
        Price = listing.Price;
        Currency = listing.Currency;
        AvailableFrom = listing.AvailableFrom;
        OwnerContact = listing.OwnerContact;
        Area = listing.Area;
        AvailableSince = listing.AvailableSince;
        Location = listing.Location;
    }
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; }
    public DateOnly AvailableFrom { get; set; }
    public string OwnerContact { get; set; }
    public decimal Area { get; set; }
    public DateOnly AvailableSince { get; set; }
    public Address Location { get; set; }
}