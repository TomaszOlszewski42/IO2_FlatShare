using FlatShareBackend.Dtos.Listings;

namespace FlatShareBackend.Services;

public interface IListingService
{
    public Task<Guid> Create(CreateListingRequest request, Guid userId);
    public Task<ListingDto> Get(Guid listingId, Guid requetingUser);
}
