using FlatShareBackend.Data;
using FlatShareBackend.Dtos.Listings;
using FlatShareBackend.Exceptions;
using FlatShareBackend.Models;
using FlatShareBackend.Repositories;

namespace FlatShareBackend.Services;

public class ListingServce : IListingService
{
    private IListingRepository _repository;

    public ListingServce(IListingRepository repository)
    {
        _repository = repository;
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
            Location = request.Location
        };

        await _repository.Create(listing);
        return guid;
    }

    public async Task<ListingDto> Get(Guid listingId, Guid requetingUser)
    {
        var listing = await _repository.Get(listingId, requetingUser);
        return new ListingDto(listing);
    }
}