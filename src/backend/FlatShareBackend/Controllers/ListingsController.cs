using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FlatShareBackend.Dtos.Listings;

namespace FlatShareBackend.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/listings")]
public class ListingsController : ControllerBase
{
    [HttpPost()]
    public async Task<IActionResult> Create([FromBody] CreateListingRequest request)
    {
        return BadRequest();
    }

    [HttpGet("{listingId}")]
    public async Task<IActionResult> GetDetails(int listingId)
    {
        return BadRequest();
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
