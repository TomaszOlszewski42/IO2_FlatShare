using FlatShareBackend.AgregationClasses;
using FlatShareBackend.Application.Services.Matching;
using FlatShareBackend.Domain.Models;
using Xunit;

namespace FlatShareBackendTests.Services.Matching;

public class DefaultMatchScoreCalculatorTests
{
    private readonly DefaultMatchScoreCalculator _calculator;

    public DefaultMatchScoreCalculatorTests()
    {
        _calculator = new DefaultMatchScoreCalculator();
    }

    [Fact]
    public void GetScoreExpression_WhenPerfectMatch_ReturnsOne()
    {
        // Arrange
        var preferences = new UserPreferences
        {
            OwnerId = Guid.NewGuid(),
            MaxPrice = 1500,
            Currency = "PLN",
            PetsAllowed = true,
            SmokingAllowed = true,
            PreferredDistricts = ["Mokotów", "Ursynów"]
        };

        var listing = new Listing
        {
            Id = Guid.NewGuid(),
            OwnerId = Guid.NewGuid(),
            Title = "Test",
            Description = "Test",
            Price = 1400,
            Currency = "PLN",
            AvailableFrom = DateOnly.FromDateTime(DateTime.Now),
            AvailableSince = DateOnly.FromDateTime(DateTime.Now),
            OwnerContact = "123",
            Area = 20,
            Location = new Address { City = "Warszawa", District = "Mokotów", Street = "Test", AptNumber = "1" },
            Status = Listing.State.ACTIVE,
            Attributes = new ListingAttributes
            {
                PetsAllowed = true,
                NonSmokingOnly = false, // Lokator pali, ogłoszenie na to pozwala
                CloseToShops = true,
                Profile = UserProfile.Student
            }
        };

        var compileFunc = _calculator.GetScoreExpression(preferences).Compile();

        // Act
        var score = compileFunc(listing);

        // Assert
        Assert.Equal(1.0f, score);
    }

    [Fact]
    public void GetScoreExpression_WhenPreferencesAreNull_ReturnsOneAsNeutral()
    {
        // Arrange
        var preferences = new UserPreferences
        {
            OwnerId = Guid.NewGuid(),
            MaxPrice = null,
            Currency = null,
            PetsAllowed = null, // Użytkownikowi obojętne czy można mieć zwierzęta
            SmokingAllowed = null, 
            PreferredDistricts = [] // Pusta lista dystryktów = obojętne
        };

        var listing = new Listing
        {
            Id = Guid.NewGuid(),
            OwnerId = Guid.NewGuid(),
            Title = "Test",
            Description = "Test",
            Price = 99999, // Cena kosmiczna, ale preferencji brakuje
            Currency = "USD",
            AvailableFrom = DateOnly.FromDateTime(DateTime.Now),
            AvailableSince = DateOnly.FromDateTime(DateTime.Now),
            OwnerContact = "123",
            Area = 20,
            Location = new Address { City = "Warszawa", District = "Daleko", Street = "Test", AptNumber = "1" },
            Status = Listing.State.ACTIVE,
            Attributes = new ListingAttributes
            {
                PetsAllowed = false,
                NonSmokingOnly = true, 
                CloseToShops = true,
                Profile = UserProfile.Student
            }
        };

        var compileFunc = _calculator.GetScoreExpression(preferences).Compile();

        // Act
        var score = compileFunc(listing);

        // Assert
        // Skoro użytkownik nie sprecyzował preferencji, algorytm nie może go "karać" za nic.
        Assert.Equal(1.0f, score);
    }

    [Fact]
    public void GetScoreExpression_WhenNothingMatches_ReturnsZero()
    {
        // Arrange
        var preferences = new UserPreferences
        {
            OwnerId = Guid.NewGuid(),
            MaxPrice = 1000,
            Currency = "PLN",
            PetsAllowed = true,
            SmokingAllowed = true,
            PreferredDistricts = ["Mokotów"]
        };

        var listing = new Listing
        {
            Id = Guid.NewGuid(),
            OwnerId = Guid.NewGuid(),
            Title = "Test",
            Description = "Test",
            Price = 2000, // Zbyt wysoka (traci 0.4)
            Currency = "PLN",
            AvailableFrom = DateOnly.FromDateTime(DateTime.Now),
            AvailableSince = DateOnly.FromDateTime(DateTime.Now),
            OwnerContact = "123",
            Area = 20,
            Location = new Address { City = "Warszawa", District = "Śródmieście", Street = "Test", AptNumber = "1" }, // Zły dystrykt (traci 0.2)
            Status = Listing.State.ACTIVE,
            Attributes = new ListingAttributes
            {
                PetsAllowed = false, // Brak zwierząt, a lokator chce (traci 0.2)
                NonSmokingOnly = true, // Tylko niepalący, a lokator pali (traci 0.2)
                CloseToShops = true,
                Profile = UserProfile.Student
            }
        };

        var compileFunc = _calculator.GetScoreExpression(preferences).Compile();

        // Act
        var score = compileFunc(listing);

        // Assert
        Assert.Equal(0.0f, score);
    }

    [Fact]
    public void GetScoreExpression_WhenOnlyDistrictAndPriceMatch_ReturnsExpectedSum()
    {
        // Arrange
        var preferences = new UserPreferences
        {
            OwnerId = Guid.NewGuid(),
            MaxPrice = 1500,
            Currency = "PLN",
            PetsAllowed = true,
            SmokingAllowed = true,
            PreferredDistricts = ["Mokotów"]
        };

        var listing = new Listing
        {
            Id = Guid.NewGuid(),
            OwnerId = Guid.NewGuid(),
            Title = "Test",
            Description = "Test",
            Price = 1500, // Dobre (0.4)
            Currency = "PLN",
            AvailableFrom = DateOnly.FromDateTime(DateTime.Now),
            AvailableSince = DateOnly.FromDateTime(DateTime.Now),
            OwnerContact = "123",
            Area = 20,
            Location = new Address { City = "Warszawa", District = "Mokotów", Street = "Test", AptNumber = "1" }, // Dobre (0.2)
            Status = Listing.State.ACTIVE,
            Attributes = new ListingAttributes
            {
                PetsAllowed = false, // Złe, lokator chce (0.0)
                NonSmokingOnly = true, // Złe, lokator pali (0.0)
                CloseToShops = true,
                Profile = UserProfile.Student
            }
        };

        var compileFunc = _calculator.GetScoreExpression(preferences).Compile();

        // Act
        var score = compileFunc(listing);

        // Assert
        // Zgodność: Cena (0.4) + Dystrykt (0.2) = 0.6
        // Oczekujemy dokładności w granicach typu float
        Assert.InRange(score, 0.59f, 0.61f); 
    }
}