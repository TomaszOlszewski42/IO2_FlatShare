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
        await _repository.AddUnavailability(listingId, requestingUser, dates);
    }

    public async Task ChangeState(Guid listingId, Guid requestingUser, Listing.State state)
    {
        await _repository.ChangeState(listingId, requestingUser, state);
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
            Status = Listing.State.ACTIVE
        };

        await _repository.Create(listing);
        return guid;
    }

    public async Task Edit(Guid listingId, Guid requestingUser, EditListingRequest editRequest)
    {
        await _repository.Edit(listingId, requestingUser, editRequest);
    }

    public async Task<ListingDto> Get(Guid listingId, Guid requetingUser)
    {
        var listing = await _repository.Get(listingId, requetingUser);
        return new ListingDto(listing);
    }

    public async Task<Listing> TestingGet(Guid listingId, Guid user)
    {
        return await _repository.Get(listingId, user);
    }
    
}