using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Dtos.Listings;

public class ListingDto
{
    public ListingDto() { }

    public ListingDto(Listing listing)
    {
        Id = listing.Id;
        OwnerId = listing.OwnerId;
        Title = listing.Title;
        Description = listing.Description;
        Price = listing.Price;
        Currency = listing.Currency;
        AvailableSince = listing.AvailableSince;
        OwnerContact = listing.OwnerContact;
        Area = listing.Area;
        AvailableUntil = listing.AvailableUntil;
        Location = listing.Location;
        Attributes = listing.Attributes;
        Status = listing.Status;
        Unavailability = listing.UnavailableDates;
    }
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; }
    public DateOnly AvailableSince { get; set; }
    public string OwnerContact { get; set; }
    public decimal Area { get; set; }
    public DateOnly AvailableUntil { get; set; }
    public Address Location { get; set; }
    public ListingAttributes Attributes { get; set; }
    public Listing.State Status { get; set; }
    public List<DateRange> Unavailability { get; set; }
}