using FlatShareBackend.Application.Dtos.Listings;
using FlatShareBackend.Application.Services.FilesManagment;
using FlatShareBackend.Domain.Exceptions;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Infrastructure.Repositories;

namespace FlatShareBackend.Application.Services.Listings;

public class ListingService : IListingService
{
    private readonly IListingRepository _repository;
    private readonly IListingValidator _listingValidator;
    public readonly IFilesService _fileService;

    public ListingService(IListingRepository repository, IListingValidator listingValidator, IFilesService fileService)
    {
        _repository = repository;
        _listingValidator = listingValidator;
        _fileService = fileService;
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
            Status = Listing.State.AWAITING_REVIEW,
            Attributes = request.Attributes
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

    public async Task<Guid> UploadPhoto(Guid listingId, IFormFile formFile, Guid requestingUser)
    {
        var listing = await _repository.Get(listingId);
        
        if (requestingUser != listing.OwnerId) // TODO: probably should allow admin
        {
            throw new UnauthorizedDatabaseOperation("Missing permission to delete this photo");
        }

        var fileStream = formFile.OpenReadStream();
        var photoId = await _fileService.UploadFromStream(fileStream);
        listing.Photos.Add(photoId);
        await _repository.SaveChangesAsync();
        return photoId;
    }

    public async Task<Stream> GetPhotoStream(Guid listingId, Guid photoId)
    {
        var listing = await _repository.Get(listingId);
        if (!listing.Photos.Contains(photoId))
        {
            throw new InvalidIdException("This photo ID does not belong to this listing!");
        }
        var photoStream =  await _fileService.GetFile($"{photoId}");
        return photoStream;
    }

    public async Task<IEnumerable<Guid>> GetAllPhotosId(Guid listingId)
    {
        var listing = await _repository.Get(listingId);
        return listing.Photos;
    } 

    public async Task DeletePhoto(Guid listingId, Guid photoId, Guid requestingUser)
    {
        var listing = await _repository.Get(listingId);

        if (requestingUser != listing.OwnerId) // TODO: probably should allow admin
        {
            throw new UnauthorizedDatabaseOperation("Missing permission to delete this photo");
        }

        listing.Photos.Remove(photoId);
        await _repository.SaveChangesAsync();
    }
}
