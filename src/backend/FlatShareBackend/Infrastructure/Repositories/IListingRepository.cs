using FlatShareBackend.Application.Dtos.Matches;
using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Infrastructure.Repositories;

public interface IListingRepository
{
    public Task Add(Listing listing);
    public Task<Listing> Get(Guid listingId);
    public Task SaveChangesAsync();
    public Task UpdateAsync(Listing listing, CancellationToken cancellationToken = default);
    public Task<List<Listing>> GetByOwnerIdAsync(Guid ownerId, CancellationToken cancellationToken = default);
    public Task<List<Listing>> QueryListings(string? City, string? District, string? Street, string? AptNumber, 
        Guid? OwnerId); // TODO: coś bardziej rozszerzalnego?
    public IQueryable<Listing> GetQuery(PagingQueryArgs args);
}
