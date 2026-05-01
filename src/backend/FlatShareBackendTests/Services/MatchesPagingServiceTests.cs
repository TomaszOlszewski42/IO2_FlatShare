using AutoFixture;
using FlatShareBackend.Services;
using Moq;
using MockQueryable;
using FlatShareBackend.Application.Dtos.Matches;
using FlatShareBackend.Application.Services;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Application.Services.Matching;
using FlatShareBackend.Application.Services.MatchesPaging;
using FlatShareBackend.Infrastructure.Repositories.Preferences;
using FlatShareBackend.Infrastructure.Repositories.Listings;

namespace FlatShareBackendTests.Services;

public class MatchesPagingServiceTest
{
    private readonly Mock<IPreferencesRepository> _preferencesRepoMock;
    private readonly Mock<IMatchScoreCalculator> _matchScoreProv;
    private readonly Mock<IListingRepository> _listRepoMock;
    private readonly Guid _userGuid;
    private readonly UserPreferences _preferences;

    public MatchesPagingServiceTest()
    {
        _preferencesRepoMock = new Mock<IPreferencesRepository>();
        _userGuid = new Guid();
        _matchScoreProv = new Mock<IMatchScoreCalculator>();
        _listRepoMock = new Mock<IListingRepository>();
        _preferences = new UserPreferences { OwnerId = _userGuid };
    }

    private Fixture CreateFixture()
    {
        var fixture = new Fixture();
        fixture.Behaviors.OfType<ThrowingRecursionBehavior>().ToList()
            .ForEach(b => fixture.Behaviors.Remove(b));
        fixture.Behaviors.Add(new OmitOnRecursionBehavior());
        fixture.Customize<DateOnly>(composer => composer.FromFactory<DateTime>(DateOnly.FromDateTime));
        fixture.Customize<Listing>(o => o
            .With(x => x.OwnerId, _userGuid)
            .Without(x => x.Owner)
        );

        return fixture;
    }

    [Fact]
    public async Task GetPage_ShouldReturnListingsOrderedByMatchScore()
    {
        // Arrange
        var fixture = CreateFixture();
        var userId = Guid.NewGuid();
        var args = new PagingArgs { Page = 0, Size = 10 };
        
        var listings = fixture.CreateMany<Listing>(5).ToList();
        IQueryable<Listing> mockQueryable = listings.BuildMock();
        
        _preferencesRepoMock.Setup(x => x.Get(_userGuid)).ReturnsAsync(_preferences);

        _listRepoMock.Setup(x => x.GetQuery(It.IsAny<PagingQueryArgs>())).Returns(mockQueryable);

        var maxPrice = listings.Max(l => (float)l.Price);
        _matchScoreProv.Setup(x => x.GetScoreExpression(It.IsAny<UserPreferences>()))
                    .Returns(x => (float)x.Price / maxPrice);

        var service = new MatchesPagingService(
            _listRepoMock.Object, 
            _preferencesRepoMock.Object, 
            _matchScoreProv.Object);

        // Act
        var result = await service.GetPage(args, userId);

        // Assert
        var sorted_prices = listings.OrderByDescending(x => x.Price).Select(x => x.Price);
        Assert.True(result.Content.Select(x => x.Listing.Price).SequenceEqual(sorted_prices));
    }

    [Theory]
    [InlineData(5, 2, 3)] // 5 elementów, strona rozmiaru 2 -> 3 strony
    [InlineData(10, 5, 2)] // 10 elementów, strona rozmiaru 5 -> 2 strony
    [InlineData(0, 10, 0)] // 0 elementów -> 0 stron
    public async Task GetPage_ShouldCalculateCorrectTotalPages(int totalCount, int pageSize, int expectedPages)
    {
        // Arrange
        var fixture = CreateFixture();

        var listings = fixture.CreateMany<Listing>(totalCount).ToList();
        IQueryable<Listing> mockQueryable = listings.BuildMock();

        var args = new PagingArgs { Page = 0, Size = pageSize };

        _preferencesRepoMock.Setup(x => x.Get(_userGuid)).ReturnsAsync(_preferences);

        _listRepoMock.Setup(x => x.GetQuery(It.IsAny<PagingQueryArgs>())).Returns(mockQueryable);
        
        _matchScoreProv.Setup(x => x.GetScoreExpression(It.IsAny<UserPreferences>()))
                    .Returns(x => 1.0f);

        var service = new MatchesPagingService(
            _listRepoMock.Object, 
            _preferencesRepoMock.Object, 
            _matchScoreProv.Object);

        // Act
        var result = await service.GetPage(args, _userGuid);

        // Assert
        Assert.Equal(expectedPages, result.Page.TotalPages);
        Assert.Equal(totalCount, result.Page.TotalElements);
    }

    [Fact]
    public async Task GetPage_EmptyPageMatch_ShouldReturnEmptyContentList()
    {
        // Arrange
        var fixture = CreateFixture();

        var listings = new List<Listing>();
        IQueryable<Listing> mockQueryable = listings.BuildMock();

        var args = new PagingArgs { Page = 2, Size = 5 };

        _preferencesRepoMock.Setup(x => x.Get(_userGuid)).ReturnsAsync(_preferences);

        _listRepoMock.Setup(x => x.GetQuery(It.IsAny<PagingQueryArgs>())).Returns(mockQueryable);
        
        _matchScoreProv.Setup(x => x.GetScoreExpression(It.IsAny<UserPreferences>()))
                    .Returns(x => 1.0f);

        var service = new MatchesPagingService(
            _listRepoMock.Object, 
            _preferencesRepoMock.Object, 
            _matchScoreProv.Object);

        // Act
        var result = await service.GetPage(args, _userGuid);

        // Assert
        Assert.Empty(result.Content);
    }
}