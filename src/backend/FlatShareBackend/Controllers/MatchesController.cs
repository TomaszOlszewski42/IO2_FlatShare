using FlatShareBackend.AgregationClasses;
using FlatShareBackend.Extensions;
using FlatShareBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlatShareBackend.Controllers;

[ApiController]
[Route("api/v1/matches")]
public class MatchesController : ControllerBase
{
    private IMatchesPagingService _pagingService;

    public MatchesController(IMatchesPagingService pagingService)
    {
        _pagingService = pagingService;
    }

    [Authorize(Roles = "TENANT, ADMIN")]
    public async Task<IActionResult> GetMatches(
        [FromQuery] int page, [FromQuery] int size, [FromQuery] string? city, [FromQuery] string? district,
        [FromQuery] decimal? minPrice, [FromQuery] decimal? maxPrice, [FromQuery] bool? petsAllowed, 
        [FromQuery] bool? nonSmokingOnly, [FromQuery] bool? closeToShops, [FromQuery] string? profile, 
        [FromQuery] decimal? minArea, [FromQuery] decimal? maxArea, [FromQuery] DateOnly? startDate,
        IHttpContextAccessor accessor
    )
    {
        var args = new PagingArgs
        {
            Page = page,
            Size = size,
            City = city,
            District = district,
            MinPrice = minPrice,
            MaxPrice = maxPrice,
            PetsAllowed = petsAllowed,
            NonSmokingOnly = nonSmokingOnly,
            CloseToShops = closeToShops,
            Profile = profile,
            MinArea = minArea,
            MaxArea = maxArea,
            StartDate = startDate
        };
        var userId = accessor.ParseUserID();
        return Ok(await _pagingService.GetPage(args, userId));
    }    
}
