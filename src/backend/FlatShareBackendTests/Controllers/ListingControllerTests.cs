using FlatShareBackend.API.Controllers;
using FlatShareBackend.Application.Dtos.Listings;
using FlatShareBackend.Application.Services.Listings;
using FlatShareBackend.Domain.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Security.Claims;

namespace FlatShareBackendTests.Controllers
{
    public class ListingsControllerTests
    {
        private readonly Mock<IListingService> _listingServiceMock;
        private readonly Mock<IHttpContextAccessor> _httpContextAccessorMock;
        private readonly Guid _testUserId;
        private readonly ListingsController _controller;

        public ListingsControllerTests()
        {
            _listingServiceMock = new Mock<IListingService>();
            _httpContextAccessorMock = new Mock<IHttpContextAccessor>();
            _testUserId = Guid.NewGuid();

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, _testUserId.ToString())
            };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            var httpContext = new DefaultHttpContext { User = claimsPrincipal };
            _httpContextAccessorMock.Setup(a => a.HttpContext).Returns(httpContext);

            _controller = new ListingsController(_listingServiceMock.Object, _httpContextAccessorMock.Object);
        }

        #region Create & Get Tests

        [Fact]
        public async Task Create_ShouldReturnCreatedResult_WithListingId()
        {
            // Arrange
            var request = new CreateListingRequest
            {
                Title = "Test Title",
                Description = "Desc",
                Price = 1000,
                Currency = Currency.PLN,
                AvailableFrom = DateOnly.FromDateTime(DateTime.Now),
                AvailableSince = DateOnly.FromDateTime(DateTime.Now),
                OwnerContact = "123",
                Area = 50,
                Location = new Address { City = "Warsaw", District = "Wola", Street = "Prosta", AptNumber = "1" },
                Attributes = new ListingAttributes
                {
                    PetsAllowed = true,
                    NonSmokingOnly = true,
                    CloseToShops = false,
                    Profile = UserProfile.Student
                }
            };
            var expectedGuid = Guid.NewGuid();

            _listingServiceMock.Setup(s => s.Create(request, It.IsAny<Guid>())).ReturnsAsync(expectedGuid);

            // Act
            var result = await _controller.Create(request);

            // Assert
            var createdResult = Assert.IsType<CreatedResult>(result);
            Assert.Equal($"api/v1/listings/{expectedGuid}", createdResult.Location);

            var valueType = createdResult.Value!.GetType();
            var listingIdProp = valueType.GetProperty("listingId")!.GetValue(createdResult.Value, null);
            Assert.Equal(expectedGuid, listingIdProp);
        }

        [Fact]
        public async Task GetDetails_ShouldReturnOk_WithListingDto()
        {
            // Arrange
            var listingId = Guid.NewGuid();
            var expectedDto = new ListingDto(new Listing
            {
                Id = listingId,
                OwnerId = _testUserId,
                Title = "Test",
                Description = "Desc",
                Price = 100,
                Currency = Currency.PLN,
                AvailableFrom = new DateOnly(),
                AvailableSince = new DateOnly(),
                OwnerContact = "Contact",
                Area = 50,
                Location = new Address { City = "C", District = "D", Street = "S", AptNumber = "A" },
                Status = Listing.State.ACTIVE,
                Attributes = new ListingAttributes
                {
                    PetsAllowed = true,
                    NonSmokingOnly = true,
                    CloseToShops = false,
                    Profile = UserProfile.Student
                }
            });

            _listingServiceMock.Setup(s => s.Get(listingId, It.IsAny<Guid>())).ReturnsAsync(expectedDto);

            // Act
            var result = await _controller.GetDetails(listingId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedDto, okResult.Value);
        }

        #endregion

        #region Edit & State Modification Tests

        [Fact]
        public async Task Edit_ShouldReturnOk()
        {
            // Arrange
            var listingId = Guid.NewGuid();
            var editRequest = new EditListingRequest { Title = "Updated Title" };

            // Act
            var result = await _controller.Edit(editRequest, listingId);

            // Assert
            Assert.IsType<OkResult>(result);
            _listingServiceMock.Verify(s => s.Edit(listingId, It.IsAny<Guid>(), editRequest), Times.Once);
        }

        [Theory]
        [InlineData(Listing.State.ACTIVE)]
        [InlineData(Listing.State.HIDDEN)]
        [InlineData(Listing.State.ARCHIVED)]
        [InlineData(Listing.State.AWAITING_REVIEW)]
        [InlineData(Listing.State.AWAITING_FIXES)]
        public async Task StateChangeEndpoints_ShouldCallChangeStateAndReturnOk(Listing.State expectedState)
        {
            // Arrange
            var listingId = Guid.NewGuid();
            IActionResult result = null!;

            // Act
            switch (expectedState)
            {
                case Listing.State.ACTIVE:
                    result = await _controller.Publish(listingId);
                    break;
                case Listing.State.HIDDEN:
                    result = await _controller.Hide(listingId);
                    break;
                case Listing.State.ARCHIVED:
                    result = await _controller.Archive(listingId);
                    break;
                case Listing.State.AWAITING_REVIEW:
                    result = await _controller.Submit(listingId);
                    break;
                case Listing.State.AWAITING_FIXES:
                    result = await _controller.RequestFixes(listingId);
                    break;
            }

            // Assert
            Assert.IsType<OkResult>(result);
            _listingServiceMock.Verify(s => s.ChangeState(listingId, It.IsAny<Guid>(), expectedState), Times.Once);
        }

        #endregion

        #region Unavailability & Querying Tests

        [Fact]
        public async Task AddUnavailability_ShouldReturnOk()
        {
            // Arrange
            var listingId = Guid.NewGuid();
            var dates = new DateRange { From = new DateOnly(2025, 1, 1), To = new DateOnly(2025, 1, 10) };

            // Act
            var result = await _controller.AddUnavailability(dates, listingId);

            // Assert
            Assert.IsType<OkResult>(result);
            _listingServiceMock.Verify(s => s.AddUnvailability(listingId, It.IsAny<Guid>(), dates), Times.Once);
        }

        [Fact]
        public async Task QueryListings_ShouldReturnOk_WithListOfDtos()
        {
            // Arrange
            var expectedList = new List<ListingDto>();
            _listingServiceMock
                .Setup(s => s.QueryListings(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<Guid?>()))
                .ReturnsAsync(expectedList);

            // Act
            var result = await _controller.QueryListings("Warsaw", null, null, null, null);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(expectedList, okResult.Value);
        }

        #endregion

        #region Photo Tests

        [Fact]
        public async Task UploadPhoto_ShouldReturnCreatedAtAction()
        {
            // Arrange
            var listingId = Guid.NewGuid();
            var expectedPhotoId = Guid.NewGuid();
            var fileMock = new Mock<IFormFile>();

            _listingServiceMock.Setup(s => s.UploadPhoto(listingId, fileMock.Object, It.IsAny<Guid>())).ReturnsAsync(expectedPhotoId);

            // Act
            var result = await _controller.UploadPhoto(fileMock.Object, listingId);

            // Assert
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(_controller.GetPhoto), createdAtActionResult.ActionName);

            Assert.Equal(listingId, createdAtActionResult.RouteValues!["listingId"]);
            Assert.Equal(expectedPhotoId, createdAtActionResult.RouteValues["photoId"]);
        }

        [Fact]
        public async Task GetPhoto_ShouldReturnFileStreamResult()
        {
            // Arrange
            var listingId = Guid.NewGuid();
            var photoId = Guid.NewGuid();
            var memoryStream = new MemoryStream();

            _listingServiceMock.Setup(s => s.GetPhotoStream(listingId, photoId)).ReturnsAsync(memoryStream);

            // Act
            var result = await _controller.GetPhoto(listingId, photoId);

            // Assert
            var fileResult = Assert.IsType<FileStreamResult>(result);
            Assert.Equal("image/jpeg", fileResult.ContentType);
            Assert.Equal(memoryStream, fileResult.FileStream);
        }

        [Fact]
        public async Task GetAllPhotosIds_ShouldReturnOk_WithPhotoIds()
        {
            // Arrange
            var listingId = Guid.NewGuid();
            var expectedPhotos = new List<Guid> { Guid.NewGuid(), Guid.NewGuid() };

            _listingServiceMock.Setup(s => s.GetAllPhotosId(listingId)).ReturnsAsync(expectedPhotos);

            // Act
            var result = await _controller.GetAllPhotosIds(listingId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var valueType = okResult.Value!.GetType();
            var photosProp = valueType.GetProperty("photos")!.GetValue(okResult.Value, null) as IEnumerable<Guid>;

            Assert.NotNull(photosProp);
            Assert.Equal(expectedPhotos, photosProp);
        }

        [Fact]
        public async Task DeletePhoto_ShouldReturnNoContent()
        {
            // Arrange
            var listingId = Guid.NewGuid();
            var photoId = Guid.NewGuid();

            // Act
            var result = await _controller.DeletePhoto(listingId, photoId);

            // Assert
            Assert.IsType<NoContentResult>(result);
            _listingServiceMock.Verify(s => s.DeletePhoto(listingId, photoId, It.IsAny<Guid>()), Times.Once);
        }

        #endregion
    }
}