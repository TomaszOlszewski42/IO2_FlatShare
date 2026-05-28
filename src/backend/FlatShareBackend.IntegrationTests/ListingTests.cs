using FlatShareBackend.Application.Dtos.Listings;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.IntegrationTests.Infrastructure;
using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;

namespace FlatShareBackend.IntegrationTests
{
    public class ListingTests : IntegrationTestBase
    {
        public ListingTests(FlatShareWebAppFactory factory) : base(factory)
        {
        }

        [Fact]
        public async Task Create_AsLandlord_WithValidData_ShouldReturnCreated()
        {
            // Arrange
            await AuthenticateAsync("landlord@example.com", "LANDLORD");

            var request = new CreateListingRequest
            {
                Title = "Beautiful Room in Center",
                Description = "A very nice and sunny room in the heart of the city.",
                Price = 1200.00m,
                Currency = "PLN",
                AvailableFrom = DateOnly.FromDateTime(DateTime.Now.AddDays(1)),
                OwnerContact = "555-123-456",
                Area = 15.5m,
                AvailableSince = DateOnly.FromDateTime(DateTime.Now.AddDays(365)),
                Location = new Address
                {
                    City = "Warsaw",
                    District = "Centrum",
                    Street = "Marszałkowska",
                    AptNumber = "10"
                },
                Attributes = new ListingAttributes
                {
                    PetsAllowed = true,
                    NonSmokingOnly = false,
                    CloseToShops = true,
                    Profile = UserProfile.Student
                }
            };

            // Act
            var response = await Client.PostAsJsonAsync("/api/v1/listings", request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var result = await response.Content.ReadFromJsonAsync<CreateListingResponse>();
            result.Should().NotBeNull();
            result!.ListingId.Should().NotBeEmpty();
        }

        [Fact]
        public async Task Create_AsTenant_ShouldReturnForbidden()
        {
            // Arrange
            await AuthenticateAsync("tenant.listing@example.com", "TENANT");

            var request = new CreateListingRequest
            {
                Title = "Should Fail",
                Description = "This should fail because I am a tenant.",
                Price = 500m,
                Currency = "PLN",
                AvailableFrom = DateOnly.FromDateTime(DateTime.Now),
                OwnerContact = "123",
                Area = 10m,
                AvailableSince = DateOnly.FromDateTime(DateTime.Now),
                Location = new Address { City = "X", District = "Y", Street = "Z", AptNumber = "1" },
                Attributes = new ListingAttributes
                {
                    PetsAllowed = false,
                    NonSmokingOnly = true,
                    CloseToShops = false,
                    Profile = UserProfile.Student
                }
            };

            // Act
            var response = await Client.PostAsJsonAsync("/api/v1/listings", request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
        }

        [Fact]
        public async Task GetDetails_AfterCreation_ShouldReturnCorrectData()
        {
            // Arrange
            await AuthenticateAsync("landlord.get@example.com", "LANDLORD");

            var request = new CreateListingRequest
            {
                Title = "Room to Find",
                Description = "Test description",
                Price = 1000m,
                Currency = "PLN",
                AvailableFrom = DateOnly.FromDateTime(DateTime.Now),
                OwnerContact = "123",
                Area = 20m,
                AvailableSince = DateOnly.FromDateTime(DateTime.Now.AddDays(30)),
                Location = new Address { City = "Kraków", District = "Stare Miasto", Street = "Floriańska", AptNumber = "5" },
                Attributes = new ListingAttributes 
                { 
                    PetsAllowed = false,
                    NonSmokingOnly = true,
                    CloseToShops = true,
                    Profile = UserProfile.Student
                }
            };

            var createResponse = await Client.PostAsJsonAsync("/api/v1/listings", request);
            var createResult = await createResponse.Content.ReadFromJsonAsync<CreateListingResponse>();
            Guid listingId = createResult!.ListingId;

            // Act
            var response = await Client.GetAsync($"/api/v1/listings/{listingId}");

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);
            var details = await response.Content.ReadFromJsonAsync<ListingDto>();
            details.Should().NotBeNull();
            details!.Title.Should().Be(request.Title);
            details.Price.Should().Be(request.Price);
        }
    }
}
