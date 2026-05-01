using FlatShareBackend.AgregationClasses;
using FlatShareBackend.Data;
using FlatShareBackend.Dtos.Listings;
using FlatShareBackend.Exceptions;
using FlatShareBackend.Models;
using Microsoft.EntityFrameworkCore;
using FlatShareBackend.Extensions;

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

    public IQueryable<Listing> GetQuery(PagingQueryArgs args)
    {
        var query = _dbContext.Listings.AsQueryable()
            .WhereIf(!string.IsNullOrWhiteSpace(args.City), x => x.Location.City == args.City)
            .WhereIf(!string.IsNullOrWhiteSpace(args.District), x => x.Location.District == args.District)
            .WhereIf(args.MinPrice.HasValue, x => x.Price >= args.MinPrice!.Value)
            .WhereIf(args.MaxPrice.HasValue, x => x.Price <= args.MaxPrice!.Value)
            .WhereIf(args.MinArea.HasValue, x => x.Area >= args.MinArea!.Value)
            .WhereIf(args.MaxArea.HasValue, x => x.Area <= args.MaxArea!.Value)
            .WhereIf(args.NonSmokingOnly.HasValue, x => x.Attributes.NonSmokingOnly == args.NonSmokingOnly!.Value)
            .WhereIf(args.PetsAllowed.HasValue, x => x.Attributes.PetsAllowed == args.PetsAllowed!.Value)
            .WhereIf(args.CloseToShops.HasValue, x => x.Attributes.CloseToShops == args.CloseToShops!.Value)
            .WhereIf(!string.IsNullOrWhiteSpace(args.Profile), x => x.Attributes.Profile == args.Profile)
            .WhereIf(args.StartDate.HasValue, x => x.AvailableFrom == args.StartDate!.Value);

        return query;
    }

    public async Task<List<Listing>> QueryListings(string? city, string? district, string? street, string? aptNumber, 
        Guid? ownerId)
    {
        var query = _dbContext.Listings.AsQueryable()
            .WhereIf(!string.IsNullOrWhiteSpace(city), x => x.Location.City == city)
            .WhereIf(!string.IsNullOrWhiteSpace(district), x => x.Location.District == district)
            .WhereIf(!string.IsNullOrWhiteSpace(street), x => x.Location.Street == street)
            .WhereIf(!string.IsNullOrWhiteSpace(aptNumber), x => x.Location.AptNumber == aptNumber)
            .WhereIf(ownerId.HasValue, x => x.OwnerId == ownerId!.Value);

        return await query.ToListAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }

    public async Task UpdateAsync(Listing listing, CancellationToken cancellationToken = default)
    {
        _dbContext.Listings.Update(listing);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<List<Listing>> GetByOwnerIdAsync(Guid ownerId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Listings
            .Where(x => x.OwnerId == ownerId)
            .ToListAsync(cancellationToken);
    }
}