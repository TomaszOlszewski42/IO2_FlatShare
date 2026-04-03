using FlatShareBackend.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace FlatShareBackend.Repositories;

public interface IListingRepository
{
    public Task Create(Listing listing);
    public Task<Listing> Get(Guid listingId, Guid requestingUser);
    public Task ChangeState(Guid listingId, Guid requestingUser, Listing.State state);
    public Task AddUnavailability(Guid listingId, Guid requestingUser, DateRange dates);
}