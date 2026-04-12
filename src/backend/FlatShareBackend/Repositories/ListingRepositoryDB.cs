using FlatShareBackend.Data;
using FlatShareBackend.Dtos.Listings;
using FlatShareBackend.Exceptions;
using FlatShareBackend.Models;
using Microsoft.EntityFrameworkCore;

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

    public async Task<List<Listing>> QueryListings(string? city, string? district, string? street, string? aptNumber, 
        Guid? ownerId)
    {
        var query = _dbContext.Listings.AsQueryable();

        if (!string.IsNullOrWhiteSpace(city))
            query = query.Where(x => x.Location.City == city);

        if (!string.IsNullOrWhiteSpace(district))
            query = query.Where(x => x.Location.District == district);

        if (!string.IsNullOrWhiteSpace(street))
            query = query.Where(x => x.Location.Street == street);

        if (!string.IsNullOrWhiteSpace(aptNumber))
            query = query.Where(x => x.Location.AptNumber == aptNumber);

        if (ownerId.HasValue)
            query = query.Where(x => x.OwnerId == ownerId.Value);

        return await query.ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }
}