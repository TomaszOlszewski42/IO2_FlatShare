using FlatShareBackend.Data;
using FlatShareBackend.Dtos.Listings;
using FlatShareBackend.Exceptions;
using FlatShareBackend.Models;
using FlatShareBackend.Repositories;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Model;

namespace FlatShareBackend.Services;

public class ListingService : IListingService
{
    private readonly IListingRepository _repository;
    private readonly IListingValidator _listingValidator;

    public ListingService(IListingRepository repository, IListingValidator listingValidator)
    {
        _repository = repository;
        _listingValidator = listingValidator;
    }

    public async Task AddUnvailability(Guid listingId, Guid requestingUser, DateRange dates)
    {
        if (dates.From > dates.To)
        {
            throw new ListingValidationException("Period of time 'from' can't be later than 'to'");
        }

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

        _listingValidator.Validate(listing);

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

        // TODO: rozważyć czy jest to rozsądne rozwiązanie w ogólności
        var listingCopy = listing.DeepCopy();
        listingCopy.EditFromRequest(editRequest);
        _listingValidator.Validate(listingCopy);

        listing.EditFromRequest(editRequest);
        await _repository.SaveChangesAsync();
    }

    public async Task<ListingDto> Get(Guid listingId, Guid requetingUser)
    {
        var listing = await _repository.Get(listingId);
        return new ListingDto(listing);
    }

    public async Task<List<ListingDto>> QueryListings(string? City, string? District, string? Street, string? AptNumber, 
        Guid? OwnerId)
    {
        var listings = await _repository.QueryListings(City, District, Street, AptNumber, OwnerId);
        return [.. listings.Select(s => new ListingDto(s))];
    }
}
