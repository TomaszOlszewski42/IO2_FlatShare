using FlatShareBackend.Models;

namespace FlatShareBackend.Repositories;

public interface IListingRepository
{
    public Task Create(Listing listing);
    public Task<Listing> Get(Guid listingId, Guid requestingUser);
    public Task ChangeState(Guid listingId, Guid requestingUser, Listing.State state);
}