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
    public class OpinionTests : IntegrationTestBase
    {
        public OpinionTests(FlatShareWebAppFactory factory) : base(factory)
        {
        }

        [Fact]
        public async Task AddAndGetOpinions_ShouldWorkCorrectly()
        {
            // 1. Setup Landlord and Create Listing
            await AuthenticateAsync("landlord.opinion@example.com", "LANDLORD");
            
            var createListingRequest = new CreateListingRequest
            {
                Title = "Room for Opinions",
                Description = "A nice room to review",
                Price = 900m,
                Currency = "PLN",
                AvailableFrom = DateOnly.FromDateTime(DateTime.Now),
                OwnerContact = "123",
                Area = 16m,
                AvailableSince = DateOnly.FromDateTime(DateTime.Now.AddDays(30)),
                Location = new Address { City = "Warsaw", District = "Wola", Street = "Prosta", AptNumber = "3" },
                Attributes = new ListingAttributes { PetsAllowed = true, NonSmokingOnly = true, CloseToShops = true, Profile = UserProfile.Student }
            };

            var createListingResponse = await Client.PostAsJsonAsync("/api/v1/listings", createListingRequest);
            createListingResponse.StatusCode.Should().Be(HttpStatusCode.Created);
            var listingResult = await createListingResponse.Content.ReadFromJsonAsync<CreateListingResponse>();
            Guid listingId = listingResult!.ListingId;

            // 2. Setup Tenant and Add Opinion
            await AuthenticateAsync("tenant.opinion@example.com", "TENANT");

            var addOpinionRequest = new AddListingOpinionRequest
            {
                ListingId = listingId,
                Rating = 5,
                Comment = "Perfect place, highly recommend!"
            };

            var addResponse = await Client.PostAsJsonAsync($"/api/v1/listings/{listingId}/opinions", addOpinionRequest);
            addResponse.StatusCode.Should().Be(HttpStatusCode.Created);
            var opinionResult = await addResponse.Content.ReadFromJsonAsync<ListingOpinionDto>();
            
            opinionResult.Should().NotBeNull();
            opinionResult!.ListingId.Should().Be(listingId);
            opinionResult.Rating.Should().Be(5);
            opinionResult.Comment.Should().Be(addOpinionRequest.Comment);

            // 3. Fetch Opinions for the Listing
            var getResponse = await Client.GetAsync($"/api/v1/listings/{listingId}/opinions");
            getResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            var opinions = await getResponse.Content.ReadFromJsonAsync<List<ListingOpinionDto>>();

            opinions.Should().NotBeNull();
            opinions.Should().ContainSingle();
            opinions![0].Rating.Should().Be(5);
            opinions[0].Comment.Should().Be("Perfect place, highly recommend!");
        }
    }
}
