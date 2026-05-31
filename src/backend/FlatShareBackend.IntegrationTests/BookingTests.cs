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
            var payResponse = await Client.PostAsJsonAsync($"/api/v1/bookings/{bookingId}/pay", 
                new PaymentRequest
                {
                    PaymentMethod = PaymentMethod.CARD,
                    ReturnUrl = "url",
                    CancelUrl = "url"
                });
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
            var rejectResponse = await Client.PostAsJsonAsync($"/api/v1/bookings/{bookingId}/reject", 
                new CancelBookingRequest
                {
                    Reason = "Bo tak"
                });
            rejectResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // 4. Verify Status is Rejected
            var getBookingResponse = await Client.GetAsync($"/api/v1/bookings/{bookingId}");
            var bookingStatus = await getBookingResponse.Content.ReadFromJsonAsync<BookingDto>();
            bookingStatus!.Status.Should().Be(BookingStatus.Rejected);
        }

        [Fact]
        public async Task CancelBooking_ShouldWorkCorrectly()
        {
            // 1. Setup Landlord and Listing
            await AuthenticateAsync("landlord.cancel@example.com", "LANDLORD");
            var landlordToken = Client.DefaultRequestHeaders.Authorization;

            var createListingRequest = new CreateListingRequest
            {
                Title = "Room to Cancel",
                Description = "Test description",
                Price = 800m,
                Currency = "PLN",
                AvailableFrom = DateOnly.FromDateTime(DateTime.Now.AddDays(1)),
                OwnerContact = "123",
                Area = 15m,
                AvailableSince = DateOnly.FromDateTime(DateTime.Now.AddDays(30)),
                Location = new Address { City = "Warsaw", District = "Wola", Street = "Prosta", AptNumber = "4" },
                Attributes = new ListingAttributes { PetsAllowed = false, NonSmokingOnly = true, CloseToShops = true, Profile = UserProfile.Student }
            };

            var createListingResponse = await Client.PostAsJsonAsync("/api/v1/listings", createListingRequest);
            var listingResult = await createListingResponse.Content.ReadFromJsonAsync<CreateListingResponse>();
            Guid listingId = listingResult!.ListingId;

            // 2. Setup Tenant and Create Booking
            await AuthenticateAsync("tenant.cancel@example.com", "TENANT");
            var bookingRequest = new BookingRequest
            {
                ListingId = listingId,
                StartDate = DateOnly.FromDateTime(DateTime.Now.AddDays(5)),
                EndDate = DateOnly.FromDateTime(DateTime.Now.AddDays(10))
            };

            var createBookingResponse = await Client.PostAsJsonAsync("/api/v1/bookings", bookingRequest);
            var bookingResult = await createBookingResponse.Content.ReadFromJsonAsync<BookingCreatedResponse>();
            Guid bookingId = bookingResult!.BookingId;

            // 3. Tenant Cancels Booking
            var cancelResponse = await Client.PostAsJsonAsync($"/api/v1/bookings/{bookingId}/cancel", 
                new CancelBookingRequest { Reason = "Plan changed" });
            cancelResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // 4. Verify Status is Cancelled
            var getBookingResponse = await Client.GetAsync($"/api/v1/bookings/{bookingId}");
            var bookingStatus = await getBookingResponse.Content.ReadFromJsonAsync<BookingDto>();
            bookingStatus!.Status.Should().Be(BookingStatus.Cancelled);
        }

        [Fact]
        public async Task CreateBooking_WithOverlappingDates_ShouldReturnConflict()
        {
            // 1. Setup Landlord and Listing
            await AuthenticateAsync("landlord.overlap@example.com", "LANDLORD");
            var createListingRequest = new CreateListingRequest
            {
                Title = "Room for Overlaps",
                Description = "Test description",
                Price = 850m,
                Currency = "PLN",
                AvailableFrom = DateOnly.FromDateTime(DateTime.Now.AddDays(1)),
                OwnerContact = "123",
                Area = 15m,
                AvailableSince = DateOnly.FromDateTime(DateTime.Now.AddDays(30)),
                Location = new Address { City = "Warsaw", District = "Wola", Street = "Prosta", AptNumber = "5" },
                Attributes = new ListingAttributes { PetsAllowed = false, NonSmokingOnly = true, CloseToShops = true, Profile = UserProfile.Student }
            };

            var createListingResponse = await Client.PostAsJsonAsync("/api/v1/listings", createListingRequest);
            var listingResult = await createListingResponse.Content.ReadFromJsonAsync<CreateListingResponse>();
            Guid listingId = listingResult!.ListingId;

            // 2. Setup Tenant 1 and Create first Booking
            await AuthenticateAsync("tenant.overlap1@example.com", "TENANT");
            var bookingRequest1 = new BookingRequest
            {
                ListingId = listingId,
                StartDate = DateOnly.FromDateTime(DateTime.Now.AddDays(5)),
                EndDate = DateOnly.FromDateTime(DateTime.Now.AddDays(10))
            };
            var response1 = await Client.PostAsJsonAsync("/api/v1/bookings", bookingRequest1);
            response1.StatusCode.Should().Be(HttpStatusCode.Created);

            // 3. Setup Tenant 2 and attempt overlapping Booking
            await AuthenticateAsync("tenant.overlap2@example.com", "TENANT");
            var bookingRequest2 = new BookingRequest
            {
                ListingId = listingId,
                StartDate = DateOnly.FromDateTime(DateTime.Now.AddDays(8)), // Overlaps!
                EndDate = DateOnly.FromDateTime(DateTime.Now.AddDays(12))
            };
            var response2 = await Client.PostAsJsonAsync("/api/v1/bookings", bookingRequest2);
            
            // Should be 409 Conflict due to OccupiedDateException
            response2.StatusCode.Should().Be(HttpStatusCode.Conflict);
        }

        [Fact]
        public async Task CreateBooking_DuringUnavailabilityPeriod_ShouldReturnConflict()
        {
            // 1. Setup Landlord, Create Listing and Add Unavailability Period
            await AuthenticateAsync("landlord.unavail@example.com", "LANDLORD");
            var createListingRequest = new CreateListingRequest
            {
                Title = "Room for Unavailability",
                Description = "Test description",
                Price = 850m,
                Currency = "PLN",
                AvailableFrom = DateOnly.FromDateTime(DateTime.Now.AddDays(1)),
                OwnerContact = "123",
                Area = 15m,
                AvailableSince = DateOnly.FromDateTime(DateTime.Now.AddDays(30)),
                Location = new Address { City = "Warsaw", District = "Wola", Street = "Prosta", AptNumber = "6" },
                Attributes = new ListingAttributes { PetsAllowed = false, NonSmokingOnly = true, CloseToShops = true, Profile = UserProfile.Student }
            };

            var createListingResponse = await Client.PostAsJsonAsync("/api/v1/listings", createListingRequest);
            var listingResult = await createListingResponse.Content.ReadFromJsonAsync<CreateListingResponse>();
            Guid listingId = listingResult!.ListingId;

            // Add unavailability period (days 5 to 10)
            var unavailability = new DateRange
            {
                Since = DateOnly.FromDateTime(DateTime.Now.AddDays(5)),
                Until = DateOnly.FromDateTime(DateTime.Now.AddDays(10)),
                Message = "Renovation"
            };
            var unavailResponse = await Client.PostAsJsonAsync($"/api/v1/listings/{listingId}/unavailability", unavailability);
            unavailResponse.StatusCode.Should().Be(HttpStatusCode.OK);

            // 2. Setup Tenant and attempt Booking during unavailability
            await AuthenticateAsync("tenant.unavail@example.com", "TENANT");
            var bookingRequest = new BookingRequest
            {
                ListingId = listingId,
                StartDate = DateOnly.FromDateTime(DateTime.Now.AddDays(6)), // Inside unavailability!
                EndDate = DateOnly.FromDateTime(DateTime.Now.AddDays(9))
            };
            var response = await Client.PostAsJsonAsync("/api/v1/bookings", bookingRequest);
            
            // Should be 409 Conflict due to OccupiedDateException
            response.StatusCode.Should().Be(HttpStatusCode.Conflict);
        }
    }
}
