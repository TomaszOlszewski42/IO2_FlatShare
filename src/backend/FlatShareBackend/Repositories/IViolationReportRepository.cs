using FlatShareBackend.Models;
using FlatShareBackend.AgregationClasses;

namespace FlatShareBackend.Repositories;

public interface IViolationReportRepository
{
    Task<ViolationReport?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<ViolationReport>> GetPagedAsync(PagingArgs pagingArgs, ViolationReportStatus? status = null, CancellationToken cancellationToken = default);
    Task AddAsync(ViolationReport report, CancellationToken cancellationToken = default);
    Task UpdateAsync(ViolationReport report, CancellationToken cancellationToken = default);
    Task<int> CountAsync(ViolationReportStatus? status = null, CancellationToken cancellationToken = default);
}
