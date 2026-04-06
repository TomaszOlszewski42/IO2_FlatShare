using FlatShareBackend.Data;
using FlatShareBackend.Dtos.Listings;
using FlatShareBackend.Exceptions;
using FlatShareBackend.Models;
using FlatShareBackend.Repositories;

namespace FlatShareBackend.Services;

public class ListingService : IListingService
{
    private readonly IListingRepository _repository;

    public ListingService(IListingRepository repository)
    {
        _repository = repository;
    }

    public async Task AddUnvailability(Guid listingId, Guid requestingUser, DateRange dates)
    {
        var listing = await _repository.Get(listingId) 
            ?? throw new ArgumentException("No listing with this id");
        listing.UnavailableDates.Add(dates);
        await _repository.SaveChangesAsync();
    }

    public async Task ChangeState(Guid listingId, Guid requestingUser, Listing.State state)
    {
        var listing = await _repository.Get(listingId);
        
        if (listing.OwnerId != requestingUser)
        {
            throw new UnauthorizedDatabaseOperation("Unauthorized listing operation");
        }

        listing.Status = state;
        await _repository.SaveChangesAsync();
    }

    public async Task<Guid> Create(CreateListingRequest request, Guid userId)
    {
        var guid = Guid.NewGuid();
        var listing = new Listing
        {
            Id = guid,
            OwnerId = userId,
            Title = request.Title,
            Description = request.Description,
            Price = request.Price,
            Currency = request.Currency,
            AvailableFrom = request.AvailableFrom,
            AvailableSince = request.AvailableSince,
            OwnerContact = request.OwnerContact,
            Area = request.Area,
            Location = request.Location,
            Status = Listing.State.AWAITING_REVIEW
        };

        await _repository.Add(listing);
        return guid;
    }

    public async Task Edit(Guid listingId, Guid requestingUser, EditListingRequest editRequest)
    {
        var listing = await _repository.Get(listingId);

        if (listing.OwnerId != requestingUser)
        {
            throw new UnauthorizedDatabaseOperation("Unauthorized listing operation");
        }

        listing.EditFromRequest(editRequest);
        await _repository.SaveChangesAsync();
    }

    public async Task<ListingDto> Get(Guid listingId, Guid requetingUser)
    {
        var listing = await _repository.Get(listingId);
        return new ListingDto(listing);
    }
}
