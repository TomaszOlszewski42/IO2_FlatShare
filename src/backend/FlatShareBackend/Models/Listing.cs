using FlatShareBackend.Dtos.Listings;

namespace FlatShareBackend.Models;

public class Listing
{
    public Guid Id { get; set; }
    public Guid OwnerId { get; set; }
    public User Owner { get; set; }
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
