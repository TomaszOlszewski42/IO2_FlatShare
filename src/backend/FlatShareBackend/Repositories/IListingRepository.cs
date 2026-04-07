using FlatShareBackend.Dtos.Listings;
using FlatShareBackend.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace FlatShareBackend.Repositories;

public interface IListingRepository
{
    public Task Add(Listing listing);
    public Task<Listing> Get(Guid listingId);
    public Task SaveChangesAsync();
    public Task<List<Listing>> QueryListings(string? City, string? District, string? Street, string? AptNumber, 
        Guid? OwnerId); // TODO: coś bardziej rozszerzalnego?
}