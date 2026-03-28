using FlatShareBackend.Models;

namespace FlatShareBackend.Repositories;

public class ListingRepositoryDB : IListingRepository
{
    public Task CreateListing(Listing listing)
    {
        throw new NotImplementedException();
    }

    public Task<Listing> GetListing(int listingId, Guid requetingUser)
    {
        throw new NotImplementedException();
    }
}