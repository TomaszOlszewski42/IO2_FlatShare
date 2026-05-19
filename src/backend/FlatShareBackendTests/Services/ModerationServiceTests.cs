using FlatShareBackend.AgregationClasses;
using FlatShareBackend.Dtos.Reports;
using FlatShareBackend.Services;
using FlatShareBackend.Exceptions;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using FlatShareBackend.Infrastructure.Repositories;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Application.Services.Auth;
using FlatShareBackend.Infrastructure.Repositories.Users;
using FlatShareBackend.Infrastructure.Repositories.Listings;
using FlatShareBackend.Infrastructure.Repositories.Bookings;

namespace FlatShareBackendTests.Services
{
    public class ModerationServiceTests
    {
        private readonly Mock<IViolationReportRepository> _reportRepositoryMock;
        private readonly Mock<IUserRepository> _userRepositoryMock;
        private readonly Mock<IListingRepository> _listingRepositoryMock;
        private readonly Mock<IBookingRepository> _bookingRepositoryMock;
        private readonly Mock<INotificationService> _notificationServiceMock;
        private readonly ModerationService _moderationService;

        public ModerationServiceTests()
        {
            _reportRepositoryMock = new Mock<IViolationReportRepository>();
            _userRepositoryMock = new Mock<IUserRepository>();
            _listingRepositoryMock = new Mock<IListingRepository>();
            _bookingRepositoryMock = new Mock<IBookingRepository>();
            _notificationServiceMock = new Mock<INotificationService>();

            _moderationService = new ModerationService(
                _reportRepositoryMock.Object,
                _userRepositoryMock.Object,
                _listingRepositoryMock.Object,
                _bookingRepositoryMock.Object,
                new List<INotificationService> { _notificationServiceMock.Object });
        }

        [Fact]
        public async Task CreateReportAsync_ShouldSaveReport()
        {
            // Arrange
            var reporterId = Guid.NewGuid();
            var request = new CreateViolationReportRequest
            {
                Type = ViolationTargetType.LISTING,
                TargetId = Guid.NewGuid(),
                Reason = "Fraudulent content",
                Details = "Suspicious price"
            };

            // Act
            var result = await _moderationService.CreateReportAsync(reporterId, request);

            // Assert
            Assert.NotEqual(Guid.Empty, result.Id);
            _reportRepositoryMock.Verify(r => r.AddAsync(It.Is<ViolationReport>(vr =>
                vr.ReporterId == reporterId &&
                vr.TargetId == request.TargetId &&
                vr.Reason == request.Reason &&
                vr.Status == ViolationReportStatus.Open), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task BanUserAsync_ShouldBlockUserAndHideListings()
        {
            // Arrange
            var adminId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var user = new User { Id = userId, Email = "test@user.com", Status = UserStatus.Active };
            var listings = new List<Listing>
            {
                new() { 
                    Id = Guid.NewGuid(), 
                    OwnerId = userId, 
                    Title = "L1", 
                    Description = "D", 
                    Price = 1, 
                    Currency = "PLN", 
                    AvailableFrom = DateOnly.FromDateTime(DateTime.Now), 
                    AvailableSince = DateOnly.FromDateTime(DateTime.Now), 
                    OwnerContact = "C", 
                    Area = 1, 
                    Location = new Address { City = "Warsaw", District = "Mokotów", Street = "Street", AptNumber = "1" }, 
                    Status = Listing.State.ACTIVE, 
                    Attributes = new ListingAttributes { PetsAllowed = true, NonSmokingOnly = true, CloseToShops = false, Profile = UserProfile.Student } 
                },
                new() { 
                    Id = Guid.NewGuid(), 
                    OwnerId = userId, 
                    Title = "L2", 
                    Description = "D", 
                    Price = 1, 
                    Currency = "PLN", 
                    AvailableFrom = DateOnly.FromDateTime(DateTime.Now), 
                    AvailableSince = DateOnly.FromDateTime(DateTime.Now), 
                    OwnerContact = "C", 
                    Area = 1, 
                    Location = new Address { City = "Warsaw", District = "Mokotów", Street = "Street", AptNumber = "2" }, 
                    Status = Listing.State.ACTIVE, 
                    Attributes = new ListingAttributes { PetsAllowed = true, NonSmokingOnly = true, CloseToShops = false, Profile = UserProfile.Student } 
                }
            };

            _userRepositoryMock.Setup(r => r.GetByIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
            _listingRepositoryMock.Setup(r => r.GetByOwnerIdAsync(userId, It.IsAny<CancellationToken>())).ReturnsAsync(listings);
            _bookingRepositoryMock.Setup(r => r.GetLandlords(userId)).ReturnsAsync(new List<Booking>());

            // Act
            await _moderationService.BanUserAsync(adminId, userId, "Repeated violations");

            // Assert
            Assert.Equal(UserStatus.Blocked, user.Status);
            _userRepositoryMock.Verify(r => r.UpdateAsync(user, It.IsAny<CancellationToken>()), Times.Once);
            
            foreach (var listing in listings)
            {
                Assert.Equal(Listing.State.HIDDEN_BY_MODERATION, listing.Status);
                _listingRepositoryMock.Verify(r => r.UpdateAsync(listing, It.IsAny<CancellationToken>()), Times.AtLeastOnce);
            }

            _bookingRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
            _notificationServiceMock.Verify(n => n.SendUserBannedNotificationAsync(userId, "Repeated violations", It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task UpdateReportStatusAsync_ShouldUpdateStatusAndHandledBy()
        {
            // Arrange
            var adminId = Guid.NewGuid();
            var reportId = Guid.NewGuid();
            var report = new ViolationReport { Id = reportId, TargetType = ViolationTargetType.USER, TargetId = Guid.NewGuid(), ReporterId = Guid.NewGuid(), Reason = "R" };

            _reportRepositoryMock.Setup(r => r.GetByIdAsync(reportId, It.IsAny<CancellationToken>())).ReturnsAsync(report);

            // Act
            await _moderationService.UpdateReportStatusAsync(adminId, reportId, ViolationReportStatus.UnderReview);

            // Assert
            Assert.Equal(ViolationReportStatus.UnderReview, report.Status);
            Assert.Equal(adminId, report.HandledById);
            Assert.NotNull(report.HandledAt);
            _reportRepositoryMock.Verify(r => r.UpdateAsync(report, It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
