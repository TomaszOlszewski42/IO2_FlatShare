using FlatShareBackend.Data;
using FlatShareBackend.Dtos.Listings;
using FlatShareBackend.Exceptions;
using FlatShareBackend.Models;

namespace FlatShareBackend.Repositories;

public class ListingRepositoryDB : IListingRepository
{
    private readonly AppDbContext _dbContext;

    public ListingRepositoryDB(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Add(Listing listing)
    {
        var userExists = _dbContext.Users.First(u => u.Id == listing.OwnerId) 
            ?? throw new InvalidIdException($"User with this ID doesn't exist");
        
        _dbContext.Add(listing);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<Listing> Get(Guid listingId)
    {
        return await _dbContext.Listings.FindAsync(listingId) 
            ?? throw new InvalidCastException("Invalid guid of listing");
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }
}