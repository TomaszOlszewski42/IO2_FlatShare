using FlatShareBackend.Application.Dtos.Listings;
using FlatShareBackend.Application.Services.Listings;
using FlatShareBackend.Domain.Exceptions;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Infrastructure.Repositories.Listings;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace FlatShareBackendTests.Services;

public class ListingOpinionServiceTests
{
    private readonly Mock<IListingOpinionRepository> _repositoryMock;
    private readonly ListingOpinionService _service;

    public ListingOpinionServiceTests()
    {
        _repositoryMock = new Mock<IListingOpinionRepository>();
        _service = new ListingOpinionService(_repositoryMock.Object);
    }

    [Fact]
    public async Task AddOpinionAsync_ValidRequest_AddsOpinionAndReturnsDto()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var listingId = Guid.NewGuid();
        var request = new AddListingOpinionRequest
        {
            ListingId = listingId,
            Rating = 5,
            Comment = "Excellent flat!"
        };

        // Act
        var result = await _service.AddOpinionAsync(userId, request);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(listingId, result.ListingId);
        Assert.Equal(userId, result.UserId);
        Assert.Equal(5, result.Rating);
        Assert.Equal("Excellent flat!", result.Comment);
        _repositoryMock.Verify(r => r.AddOpinionAsync(It.IsAny<ListingOpinion>()), Times.Once);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(6)]
    public async Task AddOpinionAsync_InvalidRating_ThrowsListingValidationException(int invalidRating)
    {
        // Arrange
        var userId = Guid.NewGuid();
        var request = new AddListingOpinionRequest
        {
            ListingId = Guid.NewGuid(),
            Rating = invalidRating,
            Comment = "Invalid rating scale"
        };

        // Act & Assert
        await Assert.ThrowsAsync<ListingOpinionException>(() => _service.AddOpinionAsync(userId, request));
        _repositoryMock.Verify(r => r.AddOpinionAsync(It.IsAny<ListingOpinion>()), Times.Never);
    }

    [Fact]
    public async Task GetOpinionsForListingAsync_ReturnsMappedOpinions()
    {
        // Arrange
        var listingId = Guid.NewGuid();
        var opinions = new List<ListingOpinion>
        {
            new ListingOpinion { Id = Guid.NewGuid(), ListingId = listingId, UserId = Guid.NewGuid(), Rating = 4, Comment = "Good" },
            new ListingOpinion { Id = Guid.NewGuid(), ListingId = listingId, UserId = Guid.NewGuid(), Rating = 5, Comment = "Perfect" }
        };

        _repositoryMock.Setup(r => r.GetOpinionsByListingIdAsync(listingId)).ReturnsAsync(opinions);

        // Act
        var result = await _service.GetOpinionsForListingAsync(listingId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Count());
    }
}