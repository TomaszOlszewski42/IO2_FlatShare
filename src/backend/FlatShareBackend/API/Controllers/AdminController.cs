using FlatShareBackend.AgregationClasses;
using FlatShareBackend.Application.Dtos.Matches;
using FlatShareBackend.Application.Services.Auth;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Dtos.Reports;
using FlatShareBackend.Infrastructure.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlatShareBackend.API.Controllers;

[ApiController]
[Route("api/v1/admin")]
[Authorize(Roles = "ADMIN")]
public class AdminController : ControllerBase
{
    private readonly IModerationService _moderationService;

    public AdminController(IModerationService moderationService)
    {
        _moderationService = moderationService;
    }

    [HttpGet("reports")]
    public async Task<ActionResult<IEnumerable<ViolationReportDto>>> GetReports(
        [FromQuery] PagingArgs pagingArgs, 
        [FromQuery] ViolationReportStatus? status,
        CancellationToken cancellationToken)
    {
        var reports = await _moderationService.GetReportsAsync(pagingArgs, status, cancellationToken);
        return Ok(reports);
    }

    [HttpPost("users/{userId:guid}/ban")]
    public async Task<IActionResult> BanUser(
        Guid userId, 
        [FromBody] BanUserRequest request,
        IHttpContextAccessor httpAccessor,
        CancellationToken cancellationToken)
    {
        var adminId = httpAccessor.ParseUserID();
        await _moderationService.BanUserAsync(adminId, userId, request.Reason, cancellationToken);
        return NoContent();
    }

    [HttpPatch("reports/{reportId:guid}/status")]
    public async Task<IActionResult> UpdateReportStatus(
        Guid reportId, 
        [FromBody] ViolationReportStatus status,
        IHttpContextAccessor httpAccessor,
        CancellationToken cancellationToken)
    {
        var adminId = httpAccessor.ParseUserID();
        await _moderationService.UpdateReportStatusAsync(adminId, reportId, status, cancellationToken);
        return NoContent();
    }
}
