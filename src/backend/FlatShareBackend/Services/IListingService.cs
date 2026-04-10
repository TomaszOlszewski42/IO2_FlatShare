using FlatShareBackend.Dtos.Listings;
using FlatShareBackend.Models;
using Microsoft.AspNetCore.Mvc;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace FlatShareBackend.Services;

public interface IListingService
{
    public Task<Guid> Create(CreateListingRequest request, Guid userId);
    public Task<ListingDto> Get(Guid listingId, Guid requetingUser);
    public Task ChangeState(Guid listingId, Guid requestingUser, Listing.State state);
    public Task AddUnvailability(Guid listingId, Guid requestingUser, DateRange dates);
    public Task Edit(Guid listingId, Guid requestingUser, EditListingRequest editRequest);
    public Task<List<ListingDto>> QueryListings(string? City, string? District, 
        string? Street, string? AptNumber, Guid? OwnerId);
    public Task<Guid> UploadPhoto(Guid listingId, IFormFile formFile, Guid requestingUser);
    public Task<Stream> GetPhotoStream(Guid listingId, Guid photoId);
    public Task<IEnumerable<Guid>> GetAllPhotosId(Guid listingId);
    public Task DeletePhoto(Guid listingId, Guid photoId, Guid requestingUser);
}
