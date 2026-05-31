using FlatShareBackend.Application.Dtos.Matches;
using FlatShareBackend.Application.Dtos.Users;
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
    public class MatchesTests : IntegrationTestBase
    {
        public MatchesTests(FlatShareWebAppFactory factory) : base(factory)
        {
        }

        [Fact]
        public async Task PreferenceLifecycleAndMatching_ShouldWorkCorrectly()
        {
            // 1. Authenticate as Tenant
            await AuthenticateAsync("tenant.match@example.com", "TENANT");
            var tenantToken = Client.DefaultRequestHeaders.Authorization;

            // 2. Get default preferences (should be empty/default)
            var getPrefsResponse = await Client.GetAsync("/api/v1/users/me/preferences");
            getPrefsResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            var defaultPrefs = await getPrefsResponse.Content.ReadFromJsonAsync<UserPreferencesDto>();
            defaultPrefs.Should().NotBeNull();
            defaultPrefs!.MaxPrice.Should().BeNull();
            defaultPrefs.PetsAllowed.Should().BeNull();

            // 3. Update preferences
            var updatedPrefs = new UserPreferencesDto
            {
                MaxPrice = 1200m,
                Currency = "PLN",
                SmokingAllowed = false,
                PetsAllowed = true,
                PreferredDistricts = new List<string> { "Mokotów", "Wola" }
            };

            var updateResponse = await Client.PutAsJsonAsync("/api/v1/users/me/preferences", updatedPrefs);
            updateResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

            // 4. Retrieve and verify updated preferences
            getPrefsResponse = await Client.GetAsync("/api/v1/users/me/preferences");
            var currentPrefs = await getPrefsResponse.Content.ReadFromJsonAsync<UserPreferencesDto>();
            currentPrefs.Should().NotBeNull();
            currentPrefs!.MaxPrice.Should().Be(1200m);
            currentPrefs.PetsAllowed.Should().BeTrue();
            currentPrefs.PreferredDistricts.Should().Contain("Mokotów");

            // 5. Authenticate as Landlord to create test listings
            await AuthenticateAsync("landlord.match@example.com", "LANDLORD");
            var landlordToken = Client.DefaultRequestHeaders.Authorization;

            // Listing 1: Good Match (Price 1000, Mokotów, Pets Allowed)
            var createListing1 = new CreateListingRequest
            {
                Title = "Perfect Mokotow Room",
                Description = "A nice room for matches test",
                Price = 1000m,
                Currency = "PLN",
                AvailableFrom = DateOnly.FromDateTime(DateTime.Now),
                OwnerContact = "111-222-333",
                Area = 18m,
                AvailableSince = DateOnly.FromDateTime(DateTime.Now.AddDays(30)),
                Location = new Address { City = "Warsaw", District = "Mokotów", Street = "Woronicza", AptNumber = "5" },
                Attributes = new ListingAttributes { PetsAllowed = true, NonSmokingOnly = true, CloseToShops = true, Profile = UserProfile.Student }
            };
            var response1 = await Client.PostAsJsonAsync("/api/v1/listings", createListing1);
            response1.StatusCode.Should().Be(HttpStatusCode.Created);

            // Listing 2: Bad Match (Price 2000, Ursynów, No Pets)
            var createListing2 = new CreateListingRequest
            {
                Title = "Expensive Ursynow Room",
                Description = "Not a good match",
                Price = 2000m,
                Currency = "PLN",
                AvailableFrom = DateOnly.FromDateTime(DateTime.Now),
                OwnerContact = "111-222-333",
                Area = 15m,
                AvailableSince = DateOnly.FromDateTime(DateTime.Now.AddDays(30)),
                Location = new Address { City = "Warsaw", District = "Ursynów", Street = "Roentgena", AptNumber = "1" },
                Attributes = new ListingAttributes { PetsAllowed = false, NonSmokingOnly = true, CloseToShops = false, Profile = UserProfile.Student }
            };
            var response2 = await Client.PostAsJsonAsync("/api/v1/listings", createListing2);
            response2.StatusCode.Should().Be(HttpStatusCode.Created);

            // 6. Switch back to Tenant to search matches
            Client.DefaultRequestHeaders.Authorization = tenantToken;

            // Get matches
            var matchesResponse = await Client.GetAsync("/api/v1/matches?Page=0&Size=10");
            matchesResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            var matchesResult = await matchesResponse.Content.ReadFromJsonAsync<PagedMatchedListingsDto>();

            matchesResult.Should().NotBeNull();
            matchesResult!.Content.Should().NotBeNull();
            
            // Assert listing 1 has higher match score than listing 2
            var list = new List<MatchedListingDto>(matchesResult.Content);
            list.Count.Should().BeGreaterThanOrEqualTo(2);

            var bestMatch = list.Find(x => x.Listing.Title == "Perfect Mokotow Room");
            var worstMatch = list.Find(x => x.Listing.Title == "Expensive Ursynow Room");

            bestMatch.Should().NotBeNull();
            worstMatch.Should().NotBeNull();
            bestMatch!.MatchScore.Should().BeGreaterThan(worstMatch!.MatchScore);
        }
    }
}
