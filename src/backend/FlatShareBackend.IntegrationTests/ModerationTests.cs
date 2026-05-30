using FlatShareBackend.Application.Dtos.Listings;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Dtos.Reports;
using FlatShareBackend.IntegrationTests.Infrastructure;
using FlatShareBackend.Application.Dtos.Users;
using FlatShareBackend.Application.Dtos.Auth;
using FlatShareBackend.API.Controllers;
using FluentAssertions;
using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;
using FlatShareBackend.Application.Dtos.Bookings;

namespace FlatShareBackend.IntegrationTests
{
    public class ModerationTests : IntegrationTestBase
    {
        public ModerationTests(FlatShareWebAppFactory factory) : base(factory)
        {
        }

        [Fact]
        public async Task BanUser_ShouldHideListingsAndCancelBookings()
        {
            // 1. Setup Bad Landlord
            var registerRequest = new RegisterUserRequest
            {
                FirstName = "Bad",
                LastName = "Landlord",
                Email = "bad.landlord@example.com",
                Password = "SecurePassword123!",
                Role = "LANDLORD"
            };
            var regResponse = await Client.PostAsJsonAsync("/api/v1/users", registerRequest);
            var regResult = await regResponse.Content.ReadFromJsonAsync<RegisterUserResponse>();
            Guid badLandlordId = regResult!.User.Id;

            // Login as bad landlord to create a listing
            await AuthenticateAsync(registerRequest.Email, "LANDLORD");

            // Create a listing
            var listingRequest = new CreateListingRequest
            {
                Title = "Banned Listing",
                Description = "This listing will be hidden",
                Price = 1000m,
                Currency = "PLN",
                AvailableFrom = DateOnly.FromDateTime(DateTime.Now),
                OwnerContact = "123",
                Area = 10m,
                AvailableSince = DateOnly.FromDateTime(DateTime.Now.AddDays(10)),
                Location = new Address { City = "City", District = "Dist", Street = "Str", AptNumber = "1" },
                Attributes = new ListingAttributes { PetsAllowed = true, NonSmokingOnly = true, CloseToShops = true, Profile = UserProfile.Student }
            };
            var listingResponse = await Client.PostAsJsonAsync("/api/v1/listings", listingRequest);
            var listingResult = await listingResponse.Content.ReadFromJsonAsync<CreateListingResponse>();
            Guid listingId = listingResult!.ListingId;

            // 2. Tenant creates a booking
            await AuthenticateAsync("tenant.affected@example.com", "TENANT");
            var bookingRequest = new FlatShareBackend.Application.Dtos.Bookings.BookingRequest
            {
                ListingId = listingId,
                StartDate = DateOnly.FromDateTime(DateTime.Now.AddDays(1)),
                EndDate = DateOnly.FromDateTime(DateTime.Now.AddDays(2))
            };
            var bookingResponse = await Client.PostAsJsonAsync("/api/v1/bookings", bookingRequest);
            var bookingResult = await bookingResponse.Content.ReadFromJsonAsync<BookingsController.BookingCreatedResponse>();
            Guid bookingId = bookingResult!.BookingId;

            // 3. Admin bans the landlord
            await AuthenticateAsync("admin@example.com", "ADMIN");
            var banRequest = new BanUserRequest { Reason = "Violated terms" };
            var banResponse = await Client.PostAsJsonAsync($"/api/v1/admin/users/{badLandlordId}/ban", banRequest);
            banResponse.StatusCode.Should().Be(HttpStatusCode.NoContent);

            // 4. Verify side effects
            // Check listing status (should be hidden)
            var getListingResponse = await Client.GetAsync($"/api/v1/listings/{listingId}");
            var listingDetails = await getListingResponse.Content.ReadFromJsonAsync<ListingDto>();
            listingDetails!.Status.Should().Be(Listing.State.HIDDEN_BY_MODERATION);

            // Check booking status (should be cancelled)
            var getBookingResponse = await Client.GetAsync($"/api/v1/bookings/{bookingId}");
            var bookingDetails = await getBookingResponse.Content.ReadFromJsonAsync<BookingDto>();
            bookingDetails!.Status.Should().Be(BookingStatus.Cancelled);
        }
    }
}
