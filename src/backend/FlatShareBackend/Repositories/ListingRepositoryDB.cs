using FlatShareBackend.Data;
using FlatShareBackend.Exceptions;
using FlatShareBackend.Models;

namespace FlatShareBackend.Repositories;

public class ListingRepositoryDB : IListingRepository
{
    private AppDbContext _dbContext;

    public ListingRepositoryDB(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Create(Listing listing)
    {
        var userExists = _dbContext.Users.First(u => u.Id == listing.OwnerId);

        if (userExists == null)
        {
            throw new Exception($"BŁĄD: Użytkownika o ID {listing.OwnerId} nie ma w bazie danych!");
        }

        _dbContext.Add(listing);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<Listing> Get(Guid listingId, Guid requestingUser)
    {
        var listing = await _dbContext.Listings.FindAsync(listingId) ?? throw new InvalidIdException("Invalid guid of listing");
        if (listing.OwnerId != requestingUser)
        {
            throw new UnauthorizedDatabaseOperation("This user is not the owner of the listing\n");
        }
        return listing;
    }
}