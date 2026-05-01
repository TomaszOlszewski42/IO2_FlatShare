using Microsoft.EntityFrameworkCore;
using FlatShareBackend.Infrastructure.Repositories;
using FlatShareBackend.Infrastructure.Data;
using FlatShareBackend.Application.Dtos.Matches;
using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Repositories;

public class ViolationReportRepository : IViolationReportRepository
{
    private readonly AppDbContext _context;

    public ViolationReportRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ViolationReport?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.ViolationReports
            .Include(r => r.Reporter)
            .Include(r => r.HandledBy)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<ViolationReport>> GetPagedAsync(PagingArgs pagingArgs, ViolationReportStatus? status = null, CancellationToken cancellationToken = default)
    {
        var query = _context.ViolationReports
            .Include(r => r.Reporter)
            .Include(r => r.HandledBy)
            .AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(r => r.Status == status.Value);
        }

        return await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip(pagingArgs.Page * pagingArgs.Size)
            .Take(pagingArgs.Size)
            .ToListAsync(cancellationToken);
    }

    public async Task AddAsync(ViolationReport report, CancellationToken cancellationToken = default)
    {
        await _context.ViolationReports.AddAsync(report, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(ViolationReport report, CancellationToken cancellationToken = default)
    {
        _context.ViolationReports.Update(report);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<int> CountAsync(ViolationReportStatus? status = null, CancellationToken cancellationToken = default)
    {
        var query = _context.ViolationReports.AsQueryable();
        if (status.HasValue)
        {
            query = query.Where(r => r.Status == status.Value);
        }
        return await query.CountAsync(cancellationToken);
    }
}
