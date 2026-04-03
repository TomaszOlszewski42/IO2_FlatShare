using FlatShareBackend.Dtos.Listings;

namespace FlatShareBackend.Models;


public class Listing
{
    public enum State
    {
        ACTIVE,
        HIDDEN,
        ARCHIVED
    }

    public required Guid Id { get; set; }
    public required Guid OwnerId { get; set; }
    public User Owner { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public required decimal Price { get; set; }
    public required string Currency { get; set; }
    public required DateOnly AvailableFrom { get; set; }
    public required string OwnerContact { get; set; }
    public required decimal Area { get; set; }
    public required DateOnly AvailableSince { get; set; }
    public required Address Location { get; set; }
    public required State Status { get; set; }
    public List<DateRange> UnavailableDates {get; set;} = [];

    // TODO: missing match score and attributes fields
}
