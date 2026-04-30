using FlatShareBackend.Application.Dtos.Listings;
using FlatShareBackend.Application.Services.Listings;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Infrastructure.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlatShareBackend.API.Controllers;


[ApiController]
[Route("api/v1/listings")]
public class ListingsController : ControllerBase
{
    private readonly IListingService _listingService;
    private readonly Guid _userGuid;

    public ListingsController(IListingService listingService, IHttpContextAccessor httpAccessor)
    {
        _userGuid = httpAccessor.ParseUserID();
        _listingService = listingService;
    }

    [Authorize(Roles = "LANDLORD")]
    [HttpPost()]
    public async Task<IActionResult> Create([FromBody] CreateListingRequest request)
    {
        // TODO: Add try catch, probably add another error for unauthorized access
        var createdGuid = await _listingService.Create(request, _userGuid);
        var createdResult = new
        {
            listingId = createdGuid,
            status = "Active", // czy może być jakiś inny?
            createdAt = DateTime.Now
        };
        return Created($"api/v1/listings/{createdGuid}", createdResult);
    }

    [Authorize()]
    [HttpGet("{listingId}")]
    public async Task<IActionResult> GetDetails(Guid listingId)
    {
        return Ok(await _listingService.Get(listingId, _userGuid));
    }

    [HttpPatch("{listingId}")]
    [Authorize(Roles = "LANDLORD")]
    public async Task<IActionResult> Edit([FromBody] EditListingRequest request, Guid listingId)
    {
        await _listingService.Edit(listingId, _userGuid, request);
        return Ok();
    }


    // TODO: check if admin should also has this 
    [Authorize(Roles = "LANDLORD, ADMIN")]
    [HttpPatch("{listingId}/publish")]
    public async Task<IActionResult> Publish(Guid listingId)
    {
        await _listingService.ChangeState(listingId, _userGuid, Listing.State.ACTIVE);
        return Ok();
    }

    [Authorize(Roles = "LANDLORD")]
    [HttpPatch("{listingId}/hide")]
    public async Task<IActionResult> Hide(Guid listingId)
    {
        await _listingService.ChangeState(listingId, _userGuid, Listing.State.HIDDEN);
        return Ok();
    }

    // TODO: check if admin should also has this
    [Authorize(Roles = "LANDLORD, ADMIN")]
    [HttpPatch("{listingId}/archive")]
    public async Task<IActionResult> Archive(Guid listingId)
    {
        await _listingService.ChangeState(listingId, _userGuid, Listing.State.ARCHIVED);
        return Ok();
    }

    [Authorize(Roles = "LANDLORD")]
    [HttpPatch("{listingId}/submit")]
    public async Task<IActionResult> Submit(Guid listingId)
    {
        await _listingService.ChangeState(listingId, _userGuid, Listing.State.AWAITING_REVIEW);
        return Ok();
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPatch("{listingId}/request-fixes")]
    public async Task<IActionResult> RequestFixes(Guid listingId)
    {
        // TODO: state transfer validation
        await _listingService.ChangeState(listingId, _userGuid, Listing.State.AWAITING_FIXES);
        return Ok();
    }

    [Authorize(Roles = "LANDLORD")]
    [HttpPost("{listingId}/unavailability")]
    public async Task<IActionResult> AddUnavailability([FromBody] DateRange dates, Guid listingId)
    {
        await _listingService.AddUnvailability(listingId, _userGuid, dates);
        return Ok();
    }

    [Authorize]
    [HttpGet()]
    public async Task<IActionResult> QueryListings([FromQuery] string? City, [FromQuery] string? District, 
        [FromQuery] string? Street, [FromQuery] string? AptNumber, [FromQuery] Guid? OwnerId)
    {
        return Ok(await _listingService.QueryListings(City, District, Street, AptNumber, OwnerId));
    }

    [Authorize(Roles = "LANDLORD")]
    [HttpPost("{listingId}/photos")]
    public async Task<IActionResult> UploadPhoto(IFormFile photo, Guid listingId)
    {
        var photoId = await _listingService.UploadPhoto(listingId, photo, _userGuid);
        return CreatedAtAction(nameof(GetPhoto), new { listingId = listingId, photoId = photoId }, null);
    }

    [Authorize]
    [HttpGet("{listingId}/photos/{photoId}")]
    public async Task<IActionResult> GetPhoto(Guid listingId, Guid photoId)
    {
        var stream = await _listingService.GetPhotoStream(listingId, photoId);
        return File(stream, "image/jpeg");
    }

    [Authorize]
    [HttpGet("{listingId}/photos")]
    public async Task<IActionResult> GetAllPhotosIds(Guid listingId)
    {
        var result = new
        {
            listingId = listingId,
            photos = await _listingService.GetAllPhotosId(listingId)
        };
        return Ok(result);
    }

    [Authorize(Roles = "LANDLORD, ADMIN")]
    [HttpDelete("{listingId}/photos/{photoId}")]
    public async Task<IActionResult> DeletePhoto(Guid listingId, Guid photoId)
    {
        await _listingService.DeletePhoto(listingId, photoId, _userGuid);
        return NoContent();
    }
}
