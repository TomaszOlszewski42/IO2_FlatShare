using FlatShareBackend.Dtos.Listings;

namespace FlatShareBackend.Services;

public interface IListingService
{
    public Task CreateListing(CreateListingRequest request, Guid user);
    public Task<ListingDto> GetListing(int listingId, Guid requetingUser);
}
