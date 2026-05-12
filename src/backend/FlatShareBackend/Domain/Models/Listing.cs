using FlatShareBackend.Application.Dtos.Listings;

namespace FlatShareBackend.Domain.Models;

public class Listing
{
    public enum State
    {
        ACTIVE,
        HIDDEN,
        ARCHIVED,
        AWAITING_REVIEW,
        AWAITING_FIXES,
        HIDDEN_BY_MODERATION
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
    public required ListingAttributes Attributes { get; set; }
    public List<DateRange> UnavailableDates { get; set; } = [];
    public List<DateRange> BookedDates { get; set; } = [];
    public List<Guid> Photos { get; set; } = [];

    public void EditFromRequest(EditListingRequest request)
    {
        Title = request.Title ?? Title;
        Description = request.Description ?? Description;
        Price = request.Price ?? Price;
        Currency = request.Currency ?? Currency;
        AvailableFrom = request.AvailableFrom ?? AvailableFrom;
        OwnerContact = request.OwnerContact ?? OwnerContact;
        Area = request.Area ?? Area;
        AvailableSince = request.AvailableSince ?? AvailableSince;
        Location = request.Location ?? Location;
        // TODO: Podejrzane: teraz da się tym zasdaniczo dodać datę mimo że jest do tego oddzielny endpoint
        UnavailableDates = request.UnavailableDates ?? UnavailableDates; 
        Attributes = request.Attributes ?? Attributes;
    }

    public Listing DeepCopy()
    {
        var addressCopy = Location with {};
        return new Listing
        {
            Id = Id,
            OwnerId = OwnerId,
            Title = Title,
            Description = Description,
            Price = Price,
            Currency = Currency,
            AvailableFrom = AvailableFrom,
            AvailableSince = AvailableSince,
            OwnerContact = OwnerContact,
            Area = Area,
            Location = addressCopy,
            Status = Status,
            Attributes = Attributes
        };
    }
}
