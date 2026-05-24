using FlatShareBackend.Dtos.Reports;
using FlatShareBackend.Infrastructure.Repositories;
using FlatShareBackend.Application.Dtos.Matches;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Services;
using FlatShareBackend.Infrastructure.Repositories.Users;
using FlatShareBackend.Infrastructure.Repositories.Listings;
using FlatShareBackend.Infrastructure.Repositories.Bookings;
using FlatShareBackend.Domain.Exceptions;

namespace FlatShareBackend.Application.Services.Auth;

public class ModerationService : IModerationService
{
    private readonly IViolationReportRepository _reportRepository;
    private readonly IUserRepository _userRepository;
    private readonly IListingRepository _listingRepository;
    private readonly IBookingRepository _bookingRepository;
    private readonly INotificationService? _notificationService;

    public ModerationService(
        IViolationReportRepository reportRepository,
        IUserRepository userRepository,
        IListingRepository listingRepository,
        IBookingRepository bookingRepository,
        IEnumerable<INotificationService> notificationServices)
    {
        _reportRepository = reportRepository;
        _userRepository = userRepository;
        _listingRepository = listingRepository;
        _bookingRepository = bookingRepository;
        _notificationService = notificationServices.FirstOrDefault();
    }

    public async Task<CreateViolationReportResponse> CreateReportAsync(Guid reporterId, CreateViolationReportRequest request, CancellationToken cancellationToken = default)
    {
        var report = new ViolationReport
        {
            Id = Guid.NewGuid(),
            ReporterId = reporterId,
            TargetType = request.Type,
            TargetId = request.TargetId,
            Reason = request.Reason,
            Details = request.Details,
            Status = ViolationReportStatus.Open,
            CreatedAt = DateTime.UtcNow
        };

        await _reportRepository.AddAsync(report, cancellationToken);

        return new CreateViolationReportResponse { Id = report.Id };
    }

    public async Task<IEnumerable<ViolationReportDto>> GetReportsAsync(PagingArgs pagingArgs, ViolationReportStatus? status = null, CancellationToken cancellationToken = default)
    {
        var reports = await _reportRepository.GetPagedAsync(pagingArgs, status, cancellationToken);
        return reports.Select(r => new ViolationReportDto
        {
            Id = r.Id,
            TargetType = r.TargetType,
            TargetId = r.TargetId,
            ReporterId = r.ReporterId,
            ReporterEmail = r.Reporter.Email,
            Reason = r.Reason,
            Details = r.Details,
            Status = r.Status,
            CreatedAt = r.CreatedAt,
            HandledByEmail = r.HandledBy?.Email,
            HandledAt = r.HandledAt
        });
    }

    public async Task BanUserAsync(Guid adminId, Guid userId, string reason, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null) throw new UserNotFoundException(userId);

        user.Status = UserStatus.Blocked;
        await _userRepository.UpdateAsync(user, cancellationToken);

        // Hide all user's listings
        var listings = await _listingRepository.GetByOwnerIdAsync(userId, cancellationToken);
        foreach (var listing in listings)
        {
            listing.Status = Listing.State.HIDDEN_BY_MODERATION;
            await _listingRepository.UpdateAsync(listing, cancellationToken);
        }

        // Cancel all future, paid bookings (status CONFIRMED) for this landlord's listings
        var bookings = await _bookingRepository.GetLandlords(userId);
        foreach (var booking in bookings)
        {
            if (booking.Status == BookingStatus.Confirmed || booking.Status == BookingStatus.PendingPayment || booking.Status == BookingStatus.PendingApproval)
            {
                booking.Status = BookingStatus.Cancelled;
            }
        }
        await _bookingRepository.SaveChangesAsync();

        if (_notificationService != null)
        {
            await _notificationService.SendUserBannedNotificationAsync(userId, reason, cancellationToken);
        }
    }

    public async Task UpdateReportStatusAsync(Guid adminId, Guid reportId, ViolationReportStatus status, CancellationToken cancellationToken = default)
    {
        var report = await _reportRepository.GetByIdAsync(reportId, cancellationToken);
        if (report == null) throw new Exception("Report not found"); // Custom exception would be better

        report.Status = status;
        report.HandledById = adminId;
        report.HandledAt = DateTime.UtcNow;

        await _reportRepository.UpdateAsync(report, cancellationToken);
    }
}
