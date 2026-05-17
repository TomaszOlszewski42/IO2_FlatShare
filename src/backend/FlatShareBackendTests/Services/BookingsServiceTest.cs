using FlatShareBackend.Application.Dtos.Bookings;
using FlatShareBackend.Application.Dtos.Listings;
using FlatShareBackend.Application.Services.Bookings;
using FlatShareBackend.Application.Services.Listings;
using FlatShareBackend.Domain.Exceptions;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Infrastructure.Repositories.Bookings;
using FlatShareBackend.Infrastructure.Repositories.Listings;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;

namespace FlatShareBackendTests.Services;

public class BookingsServiceTest
{
    private readonly Mock<IBookingRepository> _bookingRepositoryMock;
    private readonly Mock<IListingRepository> _listingRepositoryMock;
    private readonly Mock<IBookingStatusTransitionValidator> _transitionValidatorMock;
    private readonly BookingService _service;
    public BookingsServiceTest()
    {
        _bookingRepositoryMock = new Mock<IBookingRepository>();
        _listingRepositoryMock = new Mock<IListingRepository>();
        _transitionValidatorMock = new Mock<IBookingStatusTransitionValidator>();
        _service = new BookingService(_bookingRepositoryMock.Object, 
                                    _listingRepositoryMock.Object, 
                                    _transitionValidatorMock.Object);
    }

    private static Listing CreateNewListing(Guid listingId)
    {
        return new()
        {
            Id = listingId,
            OwnerId = Guid.NewGuid(),
            Title = "Niesamowity tytuł",
            Description = "Niesamowity opis",
            Price = 1000.0m,
            Currency = "PLN",
            AvailableSince = new(2016, 5, 1),
            AvailableFrom = new(2016, 3, 3),
            OwnerContact = "Nie",
            Area = 5000.0m,
            Location = new Address
            {
                City = "Zaun",
                District = "Nazwa",
                Street = "Nie",
                AptNumber = "Nie"
            },
            Status = Listing.State.ACTIVE,
            Attributes = new ListingAttributes
            {
                PetsAllowed = false,
                NonSmokingOnly = true,
                CloseToShops = false,
                Profile = FlatShareBackend.AgregationClasses.UserProfile.Student
            }
        };
    }

    [Fact]
    public async Task CreateBooking_ValidRequest_ReturnsBooking()
    {
        var requesterId = Guid.NewGuid();
        var listingId = Guid.NewGuid();
        var bookingRequest = new BookingRequest
        {
            ListingId = listingId,
            StartDate = new(2017, 10, 12),
            EndDate = new(2018, 7, 8)
        };

        var listing = CreateNewListing(listingId);
        _listingRepositoryMock.Setup(m => m.Get(listingId)).ReturnsAsync(listing);

        var booking = await _service.CreateBooking(bookingRequest, requesterId);
        var bookingDate = new DateRange
        {
            Since = bookingRequest.StartDate,
            Until = bookingRequest.EndDate,
            Message = "Booked"
        };

        Assert.Contains(bookingDate, listing.BookedDates);
        Assert.Equal("PLN", booking.Currency);
        Assert.Equal(listingId, booking.ListingId);
        Assert.Equal(bookingRequest.StartDate, booking.Since);
        Assert.Equal(bookingRequest.EndDate, booking.Until);
        Assert.Equal(requesterId, booking.TenantId);
        Assert.Equal(10 * 1000.0m, booking.TotalCost);
    }

    [Fact]
    public async Task CreateBooking_ToEarlyStart_ShouldThrow()
    {
        var requesterId = Guid.NewGuid();
        var listingId = Guid.NewGuid();
        var bookingRequest = new BookingRequest
        {
            ListingId = listingId,
            StartDate = new(2012, 10, 12),
            EndDate = new(2018, 7, 8)
        };

        var listing = CreateNewListing(listingId);
        _listingRepositoryMock.Setup(m => m.Get(listingId)).ReturnsAsync(listing);

        await Assert.ThrowsAsync<DateTooEarlyException>(() => _service.CreateBooking(bookingRequest, requesterId));
    }

    [Fact]
    public async Task CreateBooking_StartDateBeforeEndDate_ShouldThrow()
    {
        var requesterId = Guid.NewGuid();
        var listingId = Guid.NewGuid();
        var bookingRequest = new BookingRequest
        {
            ListingId = listingId,
            StartDate = new(2020, 10, 12),
            EndDate = new(2018, 7, 8)
        };

        var listing = CreateNewListing(listingId);
        _listingRepositoryMock.Setup(m => m.Get(listingId)).ReturnsAsync(listing);

        await Assert.ThrowsAsync<InvalidDatesException>(() => _service.CreateBooking(bookingRequest, requesterId));
    }

    [Fact]
    public async Task CreateBooking_AlreadyOccupied_ShouldThrow()
    {
        var requesterId = Guid.NewGuid();
        var listingId = Guid.NewGuid();
        var bookingRequest = new BookingRequest
        {
            ListingId = listingId,
            StartDate = new(2018, 10, 12),
            EndDate = new(2020, 7, 8)
        };

        var listing = CreateNewListing(listingId);
        listing.UnavailableDates.Add(new DateRange
        {
            Since = new(2019, 11, 12),
            Until = new(2028, 2, 3),
            Message = "Renovation"
        });
        _listingRepositoryMock.Setup(m => m.Get(listingId)).ReturnsAsync(listing);

        await Assert.ThrowsAsync<OccupiedDateException>(() => _service.CreateBooking(bookingRequest, requesterId));
    }

    [Fact]
    public async Task ChangeStatusByTenant_TenantCancell_ShouldChangeStatusAndRemoveDate()
    {
        var tenantId = Guid.NewGuid();
        var listingId = Guid.NewGuid();

        var listing = CreateNewListing(listingId);
        _listingRepositoryMock.Setup(m => m.Get(listingId)).ReturnsAsync(listing);

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ListingId = listing.Id,
            Status = BookingStatus.PendingApproval,
            Since = new(2025, 10, 3),
            Until = new(2026, 10, 13),
            TotalCost = 1000.0m,
            Currency = "PLN"
        };
        listing.BookedDates.Add(new DateRange
        {
            Since = booking.Since,
            Until = booking.Until,
            Message = "Booked"
        });

        _bookingRepositoryMock.Setup(m => m.Get(booking.Id)).ReturnsAsync(booking);
        _transitionValidatorMock
            .Setup(m => m.IsTransitionLegal(BookingStatus.PendingApproval, BookingStatus.Cancelled))
            .Returns(true);

        await _service.ChangeStatusByTenant(booking.Id, BookingStatus.Cancelled, tenantId);

        Assert.Equal(BookingStatus.Cancelled, booking.Status);
        Assert.Empty(listing.BookedDates);
    }

    [Fact]
    public async Task ChangeStatusByTenant_InvalidTransition_ShouldThrow()
    {
        var tenantId = Guid.NewGuid();
        var listingId = Guid.NewGuid();

        var listing = CreateNewListing(listingId);
        _listingRepositoryMock.Setup(m => m.Get(listingId)).ReturnsAsync(listing);

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            ListingId = listing.Id,
            Status = BookingStatus.PendingApproval,
            Since = new(2025, 10, 3),
            Until = new(2026, 10, 13),
            TotalCost = 1000.0m,
            Currency = "PLN"
        };
        listing.BookedDates.Add(new DateRange
        {
            Since = booking.Since,
            Until = booking.Until,
            Message = "Booked"
        });

        _bookingRepositoryMock.Setup(m => m.Get(booking.Id)).ReturnsAsync(booking);
        _transitionValidatorMock
            .Setup(m => m.IsTransitionLegal(BookingStatus.PendingApproval, BookingStatus.Cancelled))
            .Returns(false);

        await Assert.ThrowsAsync<InvalidBookingStateTransition>(() => 
            _service.ChangeStatusByTenant(booking.Id, BookingStatus.Cancelled, tenantId));
    }

        [Fact]
    public async Task ChangeStatusByLandlord_LandlordReject_ShouldChangeStatusAndRemoveDate()
    {
        var listingId = Guid.NewGuid();

        var listing = CreateNewListing(listingId);
        _listingRepositoryMock.Setup(m => m.Get(listingId)).ReturnsAsync(listing);

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            ListingId = listing.Id,
            Status = BookingStatus.PendingApproval,
            Since = new(2025, 10, 3),
            Until = new(2026, 10, 13),
            TotalCost = 1000.0m,
            Currency = "PLN"
        };
        listing.BookedDates.Add(new DateRange
        {
            Since = booking.Since,
            Until = booking.Until,
            Message = "Booked"
        });

        _bookingRepositoryMock.Setup(m => m.Get(booking.Id)).ReturnsAsync(booking);
        _transitionValidatorMock
            .Setup(m => m.IsTransitionLegal(BookingStatus.PendingApproval, BookingStatus.Rejected))
            .Returns(true);

        await _service.ChangeStatusByLandlord(booking.Id, BookingStatus.Rejected, listing.OwnerId);

        Assert.Equal(BookingStatus.Rejected, booking.Status);
        Assert.Empty(listing.BookedDates);
    }

    [Fact]
    public async Task ChangeStatusByLandlord_InvalidTransition_ShouldThrow()
    {
        var listingId = Guid.NewGuid();

        var listing = CreateNewListing(listingId);
        _listingRepositoryMock.Setup(m => m.Get(listingId)).ReturnsAsync(listing);

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            TenantId = Guid.NewGuid(),
            ListingId = listing.Id,
            Status = BookingStatus.PendingApproval,
            Since = new(2025, 10, 3),
            Until = new(2026, 10, 13),
            TotalCost = 1000.0m,
            Currency = "PLN"
        };
        listing.BookedDates.Add(new DateRange
        {
            Since = booking.Since,
            Until = booking.Until,
            Message = "Booked"
        });

        _bookingRepositoryMock.Setup(m => m.Get(booking.Id)).ReturnsAsync(booking);
        _transitionValidatorMock
            .Setup(m => m.IsTransitionLegal(BookingStatus.PendingApproval, BookingStatus.Cancelled))
            .Returns(false);

        await Assert.ThrowsAsync<InvalidBookingStateTransition>(() => 
            _service.ChangeStatusByLandlord(booking.Id, BookingStatus.Cancelled, listing.OwnerId));
    }
}