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
    private readonly IMatchesPagingService _pagingService;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public MatchesController(IMatchesPagingService pagingService, IHttpContextAccessor httpContextAccessor)
    {
        _pagingService = pagingService;
        _httpContextAccessor = httpContextAccessor;
    }

    [Authorize(Roles = "TENANT, ADMIN")]
    public async Task<IActionResult> Get([FromQuery] PagingArgs request)
    {
        var userId = _httpContextAccessor.ParseUserID();
        return Ok(await _pagingService.GetPage(request, userId));
    }    
}
