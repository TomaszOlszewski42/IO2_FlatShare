using FlatShareBackend.AgregationClasses;
using FlatShareBackend.Application.Dtos.Listings;
using FlatShareBackend.Application.Services;
using FlatShareBackend.Application.Services.FilesManagment;
using FlatShareBackend.Application.Services.Listings;
using FlatShareBackend.Domain.Exceptions;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Infrastructure.Repositories.Listings;
using FlatShareBackend.Infrastructure.Repositories.Users;
using FlatShareBackend.Models;
using Microsoft.AspNetCore.Http;
using Moq;

namespace FlatShareBackendTests.Services
{
    public class ListingServiceTests
    {
        private readonly Mock<IListingRepository> _listingRepositoryMock;
        private readonly Mock<IListingValidator> _listingValidatorMock;
        private readonly Mock<IFilesService> _filesServiceMock;
        private readonly Mock<IUserRepository> _userRepositoryMock;
        private readonly ListingService _listingService;

        public ListingServiceTests()
        {
            _listingRepositoryMock = new Mock<IListingRepository>();
            _listingValidatorMock = new Mock<IListingValidator>();
            _filesServiceMock = new Mock<IFilesService>();
            _userRepositoryMock = new Mock<IUserRepository>();

            _listingService = new ListingService(
                _listingRepositoryMock.Object,
                _listingValidatorMock.Object,
                _filesServiceMock.Object,
                _userRepositoryMock.Object);
        }

        #region Helpers

        private Listing CreateDummyListing(Guid ownerId)
        {
            return new Listing
            {
                Id = Guid.NewGuid(),
                OwnerId = ownerId,
                Title = "Test Title",
                Description = "Test Description",
                Price = 1000,
                Currency = "PLN",
                AvailableFrom = DateOnly.FromDateTime(DateTime.Now),
                AvailableSince = DateOnly.FromDateTime(DateTime.Now),
                OwnerContact = "123456789",
                Area = 50,
                Location = new Address { City = "Warsaw", District = "Mokotow", Street = "Test", AptNumber = "1" },
                Status = Listing.State.ACTIVE,
                Photos = [],
                UnavailableDates = [],
                Attributes = new ListingAttributes
                {
                    PetsAllowed = true,
                    NonSmokingOnly = true,
                    CloseToShops = false,
                    Profile = UserProfile.Student
                }
            };
        }

        private CreateListingRequest CreateDummyCreateRequest()
        {
            return new CreateListingRequest
            {
                Title = "New Listing",
                Description = "New Description",
                Price = 1200,
                Currency = "PLN",
                AvailableFrom = DateOnly.FromDateTime(DateTime.Now),
                AvailableSince = DateOnly.FromDateTime(DateTime.Now),
                OwnerContact = "987654321",
                Area = 45,
                Location = new Address { City = "Cracow", District = "Old Town", Street = "Main", AptNumber = "2" },
                Attributes = new ListingAttributes
                {
                    PetsAllowed = true,
                    NonSmokingOnly = true,
                    CloseToShops = false,
                    Profile = UserProfile.Student
                }
            };
        }

        #endregion

        #region Create Tests

        [Fact]
        public async Task Create_ShouldSaveListing_WhenDataIsValid()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var request = CreateDummyCreateRequest();

            // Act
            var result = await _listingService.Create(request, userId);

            // Assert
            Assert.NotEqual(Guid.Empty, result);
            _listingValidatorMock.Verify(v => v.Validate(It.IsAny<Listing>()), Times.Once);
            _listingRepositoryMock.Verify(r => r.Add(It.Is<Listing>(l =>
                l.OwnerId == userId &&
                l.Title == request.Title &&
                l.Status == Listing.State.AWAITING_REVIEW)), Times.Once);
        }

        #endregion

        #region AddUnavailability Tests

        [Fact]
        public async Task AddUnvailability_ShouldThrowException_WhenFromIsGreaterThanTo()
        {
            // Arrange
            var listingId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var dates = new DateRange
            {
                From = new DateOnly(2025, 1, 10),
                To = new DateOnly(2025, 1, 5) // Invalid
            };

            // Act & Assert
            await Assert.ThrowsAsync<ListingValidationException>(() =>
                _listingService.AddUnvailability(listingId, userId, dates));
        }

        [Fact]
        public async Task AddUnvailability_ShouldAddDates_WhenValid()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var listing = CreateDummyListing(userId);
            var dates = new DateRange { From = new DateOnly(2025, 1, 5), To = new DateOnly(2025, 1, 10) };

            _listingRepositoryMock.Setup(r => r.Get(listing.Id)).ReturnsAsync(listing);

            // Act
            await _listingService.AddUnvailability(listing.Id, userId, dates);

            // Assert
            Assert.Contains(dates, listing.UnavailableDates);
            _listingRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        #endregion

        #region ChangeState Tests

        [Fact]
        public async Task ChangeState_ShouldChangeState_WhenUserIsOwner()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var listing = CreateDummyListing(userId);
            var newState = Listing.State.HIDDEN;

            _listingRepositoryMock.Setup(r => r.Get(listing.Id)).ReturnsAsync(listing);

            // Act
            await _listingService.ChangeState(listing.Id, userId, newState);

            // Assert
            Assert.Equal(newState, listing.Status);
            _listingRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task ChangeState_ShouldThrowUnauthorized_WhenUserIsNotOwner()
        {
            // Arrange
            var ownerId = Guid.NewGuid();
            var notOwnerId = Guid.NewGuid();
            var listing = CreateDummyListing(ownerId);

            _listingRepositoryMock.Setup(r => r.Get(listing.Id)).ReturnsAsync(listing);

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedDatabaseOperation>(() =>
                _listingService.ChangeState(listing.Id, notOwnerId, Listing.State.HIDDEN));

            _listingRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Never);
        }

        #endregion

        #region Edit Tests

        [Fact]
        public async Task Edit_ShouldUpdateListing_WhenUserIsOwnerAndValid()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var listing = CreateDummyListing(userId);
            var editRequest = new EditListingRequest { Title = "Updated Title" };

            _listingRepositoryMock.Setup(r => r.Get(listing.Id)).ReturnsAsync(listing);

            // Act
            await _listingService.Edit(listing.Id, userId, editRequest);

            // Assert
            Assert.Equal("Updated Title", listing.Title);
            _listingValidatorMock.Verify(v => v.Validate(It.IsAny<Listing>()), Times.Once);
            _listingRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task Edit_ShouldThrowUnauthorized_WhenUserIsNotOwner()
        {
            // Arrange
            var ownerId = Guid.NewGuid();
            var notOwnerId = Guid.NewGuid();
            var listing = CreateDummyListing(ownerId);
            var editRequest = new EditListingRequest { Title = "Updated Title" };

            _listingRepositoryMock.Setup(r => r.Get(listing.Id)).ReturnsAsync(listing);

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedDatabaseOperation>(() =>
                _listingService.Edit(listing.Id, notOwnerId, editRequest));

            _listingRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Never);
        }

        #endregion

        #region Photo Tests

        [Fact]
        public async Task UploadPhoto_ShouldAddPhotoId_WhenUserIsOwner()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var listing = CreateDummyListing(userId);
            var expectedPhotoId = Guid.NewGuid();

            var fileMock = new Mock<IFormFile>();
            var stream = new MemoryStream();
            fileMock.Setup(f => f.OpenReadStream()).Returns(stream);

            _listingRepositoryMock.Setup(r => r.Get(listing.Id)).ReturnsAsync(listing);
            _filesServiceMock.Setup(f => f.UploadFromStream(stream)).ReturnsAsync(expectedPhotoId);

            // Act
            var result = await _listingService.UploadPhoto(listing.Id, fileMock.Object, userId);

            // Assert
            Assert.Equal(expectedPhotoId, result);
            Assert.Contains(expectedPhotoId, listing.Photos);
            _listingRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task GetPhotoStream_ShouldReturnStream_WhenPhotoBelongsToListing()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var listing = CreateDummyListing(userId);
            var photoId = Guid.NewGuid();
            listing.Photos.Add(photoId);

            var expectedStream = new MemoryStream();

            _listingRepositoryMock.Setup(r => r.Get(listing.Id)).ReturnsAsync(listing);
            _filesServiceMock.Setup(f => f.GetFile($"{photoId}")).ReturnsAsync(expectedStream);

            // Act
            var result = await _listingService.GetPhotoStream(listing.Id, photoId);

            // Assert
            Assert.Equal(expectedStream, result);
        }

        [Fact]
        public async Task GetPhotoStream_ShouldThrowException_WhenPhotoDoesNotBelongToListing()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var listing = CreateDummyListing(userId);
            var invalidPhotoId = Guid.NewGuid(); // Not added to listing.Photos

            _listingRepositoryMock.Setup(r => r.Get(listing.Id)).ReturnsAsync(listing);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidIdException>(() =>
                _listingService.GetPhotoStream(listing.Id, invalidPhotoId));
        }

        [Fact]
        public async Task DeletePhoto_ShouldRemovePhoto_WhenUserIsOwner()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var listing = CreateDummyListing(userId);
            var photoId = Guid.NewGuid();
            listing.Photos.Add(photoId);

            _listingRepositoryMock.Setup(r => r.Get(listing.Id)).ReturnsAsync(listing);

            // Act
            await _listingService.DeletePhoto(listing.Id, photoId, userId);

            // Assert
            Assert.DoesNotContain(photoId, listing.Photos);
            _listingRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task DeletePhoto_ShouldThrowUnauthorized_WhenUserIsNotOwner()
        {
            // Arrange
            var ownerId = Guid.NewGuid();
            var notOwnerId = Guid.NewGuid();
            var listing = CreateDummyListing(ownerId);
            var photoId = Guid.NewGuid();
            listing.Photos.Add(photoId);

            _listingRepositoryMock.Setup(r => r.Get(listing.Id)).ReturnsAsync(listing);

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedDatabaseOperation>(() =>
                _listingService.DeletePhoto(listing.Id, photoId, notOwnerId));
        }

        #endregion

        #region Admin Permission Tests

        [Fact]
        public async Task ChangeState_ShouldSucceed_WhenUserIsAdminButNotOwner()
        {
            // Arrange
            var ownerId = Guid.NewGuid();
            var adminId = Guid.NewGuid();
            var listing = CreateDummyListing(ownerId);
            var newState = Listing.State.ACTIVE;
            var adminUser = new User { Id = adminId, Role = UserRole.Admin };

            _listingRepositoryMock.Setup(r => r.Get(listing.Id)).ReturnsAsync(listing);
            _userRepositoryMock.Setup(r => r.GetByIdAsync(adminId, It.IsAny<CancellationToken>())).ReturnsAsync(adminUser);

            // Act
            await _listingService.ChangeState(listing.Id, adminId, newState);

            // Assert
            Assert.Equal(newState, listing.Status);
            _listingRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task DeletePhoto_ShouldSucceed_WhenUserIsAdminButNotOwner()
        {
            // Arrange
            var ownerId = Guid.NewGuid();
            var adminId = Guid.NewGuid();
            var listing = CreateDummyListing(ownerId);
            var photoId = Guid.NewGuid();
            listing.Photos.Add(photoId);
            var adminUser = new User { Id = adminId, Role = UserRole.Admin };

            _listingRepositoryMock.Setup(r => r.Get(listing.Id)).ReturnsAsync(listing);
            _userRepositoryMock.Setup(r => r.GetByIdAsync(adminId, It.IsAny<CancellationToken>())).ReturnsAsync(adminUser);

            // Act
            await _listingService.DeletePhoto(listing.Id, photoId, adminId);

            // Assert
            Assert.DoesNotContain(photoId, listing.Photos);
            _listingRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        [Fact]
        public async Task Edit_ShouldSucceed_WhenUserIsAdminButNotOwner()
        {
            // Arrange
            var ownerId = Guid.NewGuid();
            var adminId = Guid.NewGuid();
            var listing = CreateDummyListing(ownerId);
            var editRequest = new EditListingRequest { Title = "Admin Edit" };
            var adminUser = new User { Id = adminId, Role = UserRole.Admin };

            _listingRepositoryMock.Setup(r => r.Get(listing.Id)).ReturnsAsync(listing);
            _userRepositoryMock.Setup(r => r.GetByIdAsync(adminId, It.IsAny<CancellationToken>())).ReturnsAsync(adminUser);

            // Act
            await _listingService.Edit(listing.Id, adminId, editRequest);

            // Assert
            Assert.Equal("Admin Edit", listing.Title);
            _listingRepositoryMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }

        #endregion

        #region Get and Query Tests

        [Fact]
        public async Task QueryListings_ShouldReturnMappedDtos()
        {
            // Arrange
            var userId = Guid.NewGuid();
            var listing1 = CreateDummyListing(userId);
            var listing2 = CreateDummyListing(userId);

            _listingRepositoryMock
                .Setup(r => r.QueryListings(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<Guid?>()))
                .ReturnsAsync(new List<Listing> { listing1, listing2 });

            // Act
            var result = await _listingService.QueryListings("Warsaw", null, null, null, null);

            // Assert
            Assert.Equal(2, result.Count);
        }

        #endregion
    }
}