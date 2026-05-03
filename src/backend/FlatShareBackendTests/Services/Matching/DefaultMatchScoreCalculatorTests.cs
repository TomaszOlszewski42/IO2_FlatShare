using FlatShareBackend.Application.Services.Matching;
using FlatShareBackend.Domain.Models;

namespace FlatShareBackendTests.Services.Matching;

public class DefaultMatchScoreCalculatorTests
{
    private readonly DefaultMatchScoreCalculator _calculator;

    public DefaultMatchScoreCalculatorTests()
    {
        _calculator = new DefaultMatchScoreCalculator();
    }

    [Fact]
    public void GetScoreExpression_WhenAllPreferencesMatch_ShouldReturn1Point0()
    {
        // Arrange
        var preferences = new UserPreferences
        {
            OwnerId = Guid.NewGuid(),
            MaxPrice = 1500m,
            Currency = "PLN",
            PetsAllowed = true,
            SmokingAllowed = false,
            PreferredDistricts = ["Mokotów", "Wola"]
        };

        var listing = new Listing
        {
            Id = Guid.NewGuid(),
            OwnerId = Guid.NewGuid(),
            Title = "Pokoik",
            Description = "Opis",
            OwnerContact = "Jan",
            Price = 1200m,
            Currency = "PLN",
            Area = 15m,
            AvailableFrom = DateOnly.FromDateTime(DateTime.Now),
            AvailableSince = DateOnly.FromDateTime(DateTime.Now),
            Status = Listing.State.ACTIVE,
            Location = new Address { City = "Warszawa", District = "Mokotów", Street = "Prosta", AptNumber = "1" },
            Attributes = new ListingAttributes { PetsAllowed = true, NonSmokingOnly = true, CloseToShops = false, Profile = "student" }
        };

        // Act
        var expression = _calculator.GetScoreExpression(preferences);
        var scoreFunc = expression.Compile();
        var result = scoreFunc(listing);

        // Assert
        Assert.Equal(1.0f, result);
    }

    [Fact]
    public void GetScoreExpression_WhenNothingMatches_ShouldReturnZero()
    {
        // Arrange
        var preferences = new UserPreferences
        {
            OwnerId = Guid.NewGuid(),
            MaxPrice = 1500m,
            Currency = "PLN",
            PetsAllowed = true,
            SmokingAllowed = true, // Lokator używający tytoniu
            PreferredDistricts = ["Wola"]
        };

        var listing = new Listing
        {
            Id = Guid.NewGuid(),
            OwnerId = Guid.NewGuid(),
            Title = "Pokoik",
            Description = "Opis",
            OwnerContact = "Jan",
            Price = 2000m, // Zbyt wysoka cena
            Currency = "PLN",
            Area = 15m,
            AvailableFrom = DateOnly.FromDateTime(DateTime.Now),
            AvailableSince = DateOnly.FromDateTime(DateTime.Now),
            Status = Listing.State.ACTIVE,
            Location = new Address { City = "Warszawa", District = "Mokotów", Street = "Prosta", AptNumber = "1" }, // Zła dzielnica
            Attributes = new ListingAttributes { PetsAllowed = false, NonSmokingOnly = true, CloseToShops = false, Profile = "student" } // Brak pozwolenia na zwierzęta i palenie
        };

        // Act
        var expression = _calculator.GetScoreExpression(preferences);
        var scoreFunc = expression.Compile();
        var result = scoreFunc(listing);

        // Assert
        Assert.Equal(0.0f, result);
    }

    [Fact]
    public void GetScoreExpression_WhenPreferencesAreEmpty_ShouldReturn1Point0AsNeutral()
    {
        // Arrange
        var preferences = new UserPreferences
        {
            OwnerId = Guid.NewGuid()
            // Zostawiamy null-e (puste preferencje). Biorąc pod uwagę specyfikację są traktowane obojętnie/neutralnie, więc dają max punktów.
        };

        var listing = new Listing
        {
            Id = Guid.NewGuid(),
            OwnerId = Guid.NewGuid(),
            Title = "Pokoik",
            Description = "Opis",
            OwnerContact = "Jan",
            Price = 4000m,
            Currency = "PLN",
            Area = 15m,
            AvailableFrom = DateOnly.FromDateTime(DateTime.Now),
            AvailableSince = DateOnly.FromDateTime(DateTime.Now),
            Status = Listing.State.ACTIVE,
            Location = new Address { City = "Warszawa", District = "Praga", Street = "Prosta", AptNumber = "1" },
            Attributes = new ListingAttributes { PetsAllowed = false, NonSmokingOnly = true, CloseToShops = false, Profile = "student" }
        };

        // Act
        var expression = _calculator.GetScoreExpression(preferences);
        var scoreFunc = expression.Compile();
        var result = scoreFunc(listing);

        // Assert
        Assert.Equal(1.0f, result);
    }
}