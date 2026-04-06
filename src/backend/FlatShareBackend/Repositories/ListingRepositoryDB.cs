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

    public async Task Create(Listing listing)
    {
        var userExists = _dbContext.Users.First(u => u.Id == listing.OwnerId) 
            ?? throw new InvalidIdException($"User with this ID doesn't exist");
        
        _dbContext.Add(listing);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<Listing> Get(Guid listingId, Guid requestingUser)
    {
        return await FindListingCheckOwner(listingId, requestingUser);
    }

    public async Task ChangeState(Guid listingId, Guid requestingUser, Listing.State state)
    {
        var listing = await FindListingCheckOwner(listingId, requestingUser);
        listing.Status = state;
        await _dbContext.SaveChangesAsync();
    }

    public async Task AddUnavailability(Guid listingId, Guid requestingUser, DateRange dates)
    {
        var listing = await FindListingCheckOwner(listingId, requestingUser);
        listing.UnavailableDates.Add(dates);
        await _dbContext.SaveChangesAsync();
    }

    public async Task Edit(Guid listingId, Guid requestingUser, EditListingRequest editRequest)
    {
        var listing = await FindListingCheckOwner(listingId, requestingUser);
        listing.EditFromRequest(editRequest);
        await _dbContext.SaveChangesAsync();
    }


    // TODO: rethink if this should be done here or in service
    private async Task<Listing> FindListingCheckOwner(Guid listingId, Guid requestingUser)
    {
        var listing = await _dbContext.Listings.FindAsync(listingId) 
            ?? throw new InvalidCastException("Invalid guid of listing");
        if (listing.OwnerId != requestingUser)
        {
            throw new UnauthorizedDatabaseOperation("This user is not the owner of the listing\n");
        }
        return listing;
    }

    private async Task<Listing> FindListing(Guid listingId)
    {
        return await _dbContext.Listings.FindAsync(listingId) 
            ?? throw new InvalidCastException("Invalid guid of listing");
    }
}