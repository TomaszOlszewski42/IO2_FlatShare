using FlatShareBackend.Dtos.Reports;
using FlatShareBackend.Extensions;
using FlatShareBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlatShareBackend.Controllers;

[ApiController]
[Route("api/v1/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly IModerationService _moderationService;

    public ReportsController(IModerationService moderationService)
    {
        _moderationService = moderationService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(CreateViolationReportResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreateViolationReportRequest request, 
        IHttpContextAccessor httpAccessor,
        CancellationToken cancellationToken)
    {
        var reporterId = httpAccessor.ParseUserID();
        var response = await _moderationService.CreateReportAsync(reporterId, request, cancellationToken);
        return Created($"/api/v1/admin/reports/{response.Id}", response);
    }
}
