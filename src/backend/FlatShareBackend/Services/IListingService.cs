using FlatShareBackend.Dtos.Listings;
using FlatShareBackend.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace FlatShareBackend.Services;

public interface IListingService
{
    public Task<Guid> Create(CreateListingRequest request, Guid userId);
    public Task<ListingDto> Get(Guid listingId, Guid requetingUser);
    public Task ChangeState(Guid listingId, Guid requestingUser, Listing.State state);
    public Task AddUnvailability(Guid listingId, Guid requestingUser, DateRange dates);
    public Task Edit(Guid listingId, Guid requestingUser, EditListingRequest editRequest);
    public Task<List<Guid>> GetOwnersListingsIds(Guid requestingUser);
}
