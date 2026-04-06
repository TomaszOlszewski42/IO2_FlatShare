using FlatShareBackend.Dtos.Listings;
using FlatShareBackend.Extensions;
using FlatShareBackend.Models;
using FlatShareBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace FlatShareBackend.Controllers;

[Authorize]
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

    [HttpGet("{listingId}")]
    public async Task<IActionResult> GetDetails(Guid listingId)
    {
        return Ok(await _listingService.Get(listingId, _userGuid));
    }

    [HttpGet("{listingId}/test")]
    public async Task<IActionResult> GetTest(Guid listingId)
    {
        return Ok(await _listingService.TestingGet(listingId, _userGuid));
    }

    [HttpPatch("{listingId}")]
    public async Task<IActionResult> Edit([FromBody] EditListingRequest request, Guid listingId)
    {
        await _listingService.Edit(listingId, _userGuid, request);
        return Ok();
    }

    [HttpPatch("{listingId}/publish")]
    public async Task<IActionResult> Publish(Guid listingId)
    {
        await _listingService.ChangeState(listingId, _userGuid, Listing.State.ACTIVE);
        return Ok();
    }

    [HttpPatch("{listingId}/hide")]
    public async Task<IActionResult> Hide(Guid listingId)
    {
        await _listingService.ChangeState(listingId, _userGuid, Listing.State.HIDDEN);
        return Ok();
    }

    [HttpPatch("{listingId}/archive")]
    public async Task<IActionResult> Archive(Guid listingId)
    {
        await _listingService.ChangeState(listingId, _userGuid, Listing.State.ARCHIVED);
        return Ok();
    }

    [HttpPatch("{listingId}/submit")]
    public async Task<IActionResult> Submit(Guid listingId)
    {
        await _listingService.ChangeState(listingId, _userGuid, Listing.State.AWAITING_REVIEW);
        return Ok();
    }

    [HttpPatch("{listingId}/request-fixes")]
    public async Task<IActionResult> RequestFixes(Guid listingId)
    {
        // TODO: state transfer validation
        await _listingService.ChangeState(listingId, _userGuid, Listing.State.AWAITING_FIXES);
        return Ok();
    }

    [HttpPost("{listingId}/unavailability")]
    public async Task<IActionResult> AddUnavailability([FromBody] DateRange dates, Guid listingId)
    {
        await _listingService.AddUnvailability(listingId, _userGuid, dates);
        return Ok();
    }
}
