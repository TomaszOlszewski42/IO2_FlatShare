using FlatShareBackend.Dtos.Reports;
using FlatShareBackend.AgregationClasses;
using FlatShareBackend.Application.Dtos.Matches;
using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Services.Auth;

public interface IModerationService
{
    Task<CreateViolationReportResponse> CreateReportAsync(Guid reporterId, CreateViolationReportRequest request, CancellationToken cancellationToken = default);
    Task<IEnumerable<ViolationReportDto>> GetReportsAsync(PagingArgs pagingArgs, ViolationReportStatus? status = null, CancellationToken cancellationToken = default);
    Task BanUserAsync(Guid adminId, Guid userId, string reason, CancellationToken cancellationToken = default);
    Task UpdateReportStatusAsync(Guid adminId, Guid reportId, ViolationReportStatus status, CancellationToken cancellationToken = default);
}
