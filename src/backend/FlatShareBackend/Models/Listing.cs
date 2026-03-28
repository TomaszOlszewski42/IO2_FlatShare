using FlatShareBackend.Dtos.Listings;

namespace FlatShareBackend.Models;

public class Listing(
    Guid id, Guid ownerId, User owner, string title, string description, decimal price, string currency, DateOnly availableFrom, 
    string ownerContact, decimal area, DateOnly availableSince, Address location
    )
{
    public Guid Id { get; set; } = id;
    public Guid OwnerId { get; set; } = ownerId;
    public User Owner { get; set; } = owner;
    public string Title { get; init; } = title;
    public string Description { get; init; } = description;
    public decimal Price { get; init; } = price;
    public string Currency { get; init; } = currency;
    public DateOnly AvailableFrom { get; init; } = availableFrom;
    public string OwnerContact { get; init; } = ownerContact;
    public decimal Area { get; init; } = area;
    public DateOnly AvailableSince { get; init; } = availableSince;
    public Address Location { get; init; } = location;
}
