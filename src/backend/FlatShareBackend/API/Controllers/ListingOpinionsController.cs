using FlatShareBackend.Application.Dtos.Listings;
using FlatShareBackend.Application.Services.Listings;
using FlatShareBackend.Infrastructure.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlatShareBackend.Controllers;

[ApiController]
[Route("api/v1/listings")]
public class ListingOpinionsController : ControllerBase
{
    private readonly IListingOpinionService _opinionService;
    private readonly Guid _userGuid;

    public ListingOpinionsController(IListingOpinionService opinionService, IHttpContextAccessor httpAccessor)
    {
        _userGuid = httpAccessor.ParseUserID();
        _opinionService = opinionService;
    }

    [Authorize]
    [HttpPost("{listingId:guid}/opinions")]
    public async Task<IActionResult> AddOpinion(Guid listingId, [FromBody] AddListingOpinionRequest request)
    {
        // Enforce URL param listingId
        if (request.ListingId != listingId)
        {
            request.ListingId = listingId;
        }

        var result = await _opinionService.AddOpinionAsync(_userGuid, request);
        return CreatedAtAction(nameof(GetOpinions), new { listingId = result.ListingId }, result);
    }

    [HttpGet("{listingId:guid}/opinions")]
    public async Task<IActionResult> GetOpinions(Guid listingId)
    {
        var opinions = await _opinionService.GetOpinionsForListingAsync(listingId);
        return Ok(opinions);
    }
}