using FlatShareBackend.Models;

namespace FlatShareBackend.Repositories;

public interface IListingRepository
{
    public Task CreateListing(Listing listing);
    public Task<Listing> GetListing(int listingId, Guid requetingUser);
}