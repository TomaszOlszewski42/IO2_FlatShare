using FlatShareBackend.Dtos.Listings;
using FlatShareBackend.Extensions;
using FlatShareBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FlatShareBackend.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/listings")]
public class ListingsController : ControllerBase
{
    private IListingService _listingService;
    private Guid _userGuid;

    public ListingsController(IListingService listingService, IHttpContextAccessor httpAccessor)
    {
        _userGuid = httpAccessor.ParseUserID();
        _listingService = listingService;
    }

    [HttpPost()]
    public async Task<IActionResult> Create([FromBody] CreateListingRequest request)
    {
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

    [HttpPatch("{listingId}")]
    public async Task<IActionResult> Edit(int listingId)
    {
        return BadRequest();
    }

    [HttpPatch("{listingId}/hide")]
    public async Task<IActionResult> Hide(int listingId)
    {
        return BadRequest();
    }

    [HttpPatch("{listingId}/archive")]
    public async Task<IActionResult> Archive(int listingId)
    {
        return BadRequest();
    }

    [HttpPatch("{listingId}/unavailability")]
    public async Task<IActionResult> AddUnavailability(int listingId)
    {
        return BadRequest();
    }
}
