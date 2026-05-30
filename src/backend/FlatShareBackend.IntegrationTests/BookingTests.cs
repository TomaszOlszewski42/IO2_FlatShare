using FlatShareBackend.Application.Dtos.Bookings;
using FlatShareBackend.Application.Dtos.Listings;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.IntegrationTests.Infrastructure;
using FluentAssertions;
using System;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;
using static FlatShareBackend.API.Controllers.BookingsController;

namespace FlatShareBackend.IntegrationTests
{
    public class BookingTests : IntegrationTestBase
    {
        public BookingTests(FlatShareWebAppFactory factory) : base(factory)
        {
        }

        [Fact]
        public async Task FullBookingFlow_ShouldWorkCorrectly()
        {
            // 1. Setup Landlord and Listing
            await AuthenticateAsync("landlord.booking@example.com", "LANDLORD");
            var landlordToken = Client.DefaultRequestHeaders.Authorization;

            var createListingRequest = new CreateListingRequest
            {
                Title = "Room for Booking",
                Description = "Test description",
                Price = 1000m,
                Currency = "PLN",
                AvailableFrom = DateOnly.FromDateTime(DateTime.Now),
                OwnerContact = "123",
                Area = 20m,
                AvailableSince = DateOnly.FromDateTime(DateTime.Now.AddDays(30)),
                Location = new Address { City = "Warsaw", District = "Centrum", Street = "Marszałkowska", AptNumber = "1" },
                Attributes = new ListingAttributes 
                { 
                    PetsAllowed = true,
                    NonSmokingOnly = true,
                    CloseToShops = true,
                    Profile = UserProfile.Student
                }
            };

            var createListingResponse = await Client.PostAsJsonAsync("/api/v1/listings", createListingRequest);
            createListingResponse.StatusCode.Should().Be(HttpStatusCode.Created);
            var listingResult = await createListingResponse.Content.ReadFromJsonAsync<CreateListingResponse>();
            Guid listingId = listingResult!.ListingId;

            // 2. Setup Tenant and Create Booking
            await AuthenticateAsync("tenant.booking@example.com", "TENANT");
            var tenantToken = Client.DefaultRequestHeaders.Authorization;

            var bookingRequest = new BookingRequest
            {
                ListingId = listingId,
                StartDate = DateOnly.FromDateTime(DateTime.Now.AddDays(5)),
                EndDate = DateOnly.FromDateTime(DateTime.Now.AddDays(10))
            };

            var createBookingResponse = await Client.PostAsJsonAsync("/api/v1/bookings", bookingRequest);
            createBookingResponse.StatusCode.Should().Be(HttpStatusCode.Created);
            var bookingResult = await createBookingResponse.Content.ReadFromJsonAsync<BookingCreatedResponse>();
            Guid bookingId = bookingResult!.BookingId;
            bookingResult.Status.Should().Be(BookingStatus.PendingApproval);

            // 3. Landlord Accepts Booking
            Client.DefaultRequestHeaders.Authorization = landlordToken;
            var acceptResponse = await Client.PostAsync($"/api/v1/bookings/{bookingId}/accept", null);
            acceptResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // 4. Verify Status is PendingPayment
            var getBookingResponse = await Client.GetAsync($"/api/v1/bookings/{bookingId}");
            getBookingResponse.StatusCode.Should().Be(HttpStatusCode.OK);
            var bookingStatus = await getBookingResponse.Content.ReadFromJsonAsync<BookingDto>();
            bookingStatus!.Status.Should().Be(BookingStatus.PendingPayment);

            // 5. Tenant Pays
            Client.DefaultRequestHeaders.Authorization = tenantToken;
            var payResponse = await Client.PostAsync($"/api/v1/bookings/{bookingId}/pay", null);
            payResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // 6. Verify Status is Confirmed
            getBookingResponse = await Client.GetAsync($"/api/v1/bookings/{bookingId}");
            bookingStatus = await getBookingResponse.Content.ReadFromJsonAsync<BookingDto>();
            bookingStatus!.Status.Should().Be(BookingStatus.Confirmed);
        }

        [Fact]
        public async Task RejectBooking_ShouldWorkCorrectly()
        {
            // 1. Setup Landlord and Listing
            await AuthenticateAsync("landlord.reject@example.com", "LANDLORD");
            var landlordToken = Client.DefaultRequestHeaders.Authorization;

            var createListingRequest = new CreateListingRequest
            {
                Title = "Room to Reject",
                Description = "Test description",
                Price = 800m,
                Currency = "PLN",
                AvailableFrom = DateOnly.FromDateTime(DateTime.Now),
                OwnerContact = "123",
                Area = 15m,
                AvailableSince = DateOnly.FromDateTime(DateTime.Now.AddDays(30)),
                Location = new Address { City = "Warsaw", District = "Wola", Street = "Prosta", AptNumber = "2" },
                Attributes = new ListingAttributes { PetsAllowed = false, NonSmokingOnly = true, CloseToShops = true, Profile = UserProfile.Student }
            };

            var createListingResponse = await Client.PostAsJsonAsync("/api/v1/listings", createListingRequest);
            var listingResult = await createListingResponse.Content.ReadFromJsonAsync<CreateListingResponse>();
            Guid listingId = listingResult!.ListingId;

            // 2. Setup Tenant and Create Booking
            await AuthenticateAsync("tenant.reject@example.com", "TENANT");
            var bookingRequest = new BookingRequest
            {
                ListingId = listingId,
                StartDate = DateOnly.FromDateTime(DateTime.Now.AddDays(1)),
                EndDate = DateOnly.FromDateTime(DateTime.Now.AddDays(2))
            };

            var createBookingResponse = await Client.PostAsJsonAsync("/api/v1/bookings", bookingRequest);
            var bookingResult = await createBookingResponse.Content.ReadFromJsonAsync<BookingCreatedResponse>();
            Guid bookingId = bookingResult!.BookingId;

            // 3. Landlord Rejects Booking
            Client.DefaultRequestHeaders.Authorization = landlordToken;
            var rejectResponse = await Client.PostAsync($"/api/v1/bookings/{bookingId}/reject", null);
            rejectResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // 4. Verify Status is Rejected
            var getBookingResponse = await Client.GetAsync($"/api/v1/bookings/{bookingId}");
            var bookingStatus = await getBookingResponse.Content.ReadFromJsonAsync<BookingDto>();
            bookingStatus!.Status.Should().Be(BookingStatus.Rejected);
        }
    }
}
