using FlatShareBackend.Dtos.Listings;
using FlatShareBackend.Models;

namespace FlatShareBackend.Services;

public interface IListingService
{
    public Task<Guid> Create(CreateListingRequest request, Guid userId);
    public Task<ListingDto> Get(Guid listingId, Guid requetingUser);
    public Task ChangeState(Guid listingId, Guid requestingUser, Listing.State state);
}
