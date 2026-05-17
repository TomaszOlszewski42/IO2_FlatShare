using System.Data.Entity.Core;
using FlatShareBackend.Application.Dtos;
using FlatShareBackend.Application.Dtos.Bookings;
using FlatShareBackend.Domain.Exceptions;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Infrastructure.Repositories.Bookings;
using FlatShareBackend.Infrastructure.Repositories.Listings;
using Microsoft.AspNetCore.Authorization;

namespace FlatShareBackend.Application.Services.Bookings;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IListingRepository _listingRepository;
    private readonly IBookingStatusTransitionValidator _transitionValidator;

    public BookingService(
        IBookingRepository bookingRepository, 
        IListingRepository listingRepository,
        IBookingStatusTransitionValidator transitionValidator
    )
    {
        _bookingRepository = bookingRepository;
        _listingRepository = listingRepository;
        _transitionValidator = transitionValidator;
    }

    public async Task ChangeStatusByLandlord(Guid bookingId, BookingStatus newStatus, Guid landlordId)
    {
        var booking = await _bookingRepository.Get(bookingId);
        var listing = await _listingRepository.Get(booking.ListingId);
        
        if (listing.OwnerId != landlordId)
        {
            throw new ForbiddenOperationException("Landlord can only change status of bookings of their listings.");
        }

        if (!_transitionValidator.IsTransitionLegal(booking.Status, newStatus))
        {
            throw new InvalidBookingStateTransition
                ($"Booking can't transition from state {booking.Status} to {newStatus}");
        }

        booking.Status = newStatus;
        await RemoveBookedDateIfUnsuccessfulBook(listing, newStatus, booking);
        await _bookingRepository.SaveChangesAsync();
    }


    public async Task ChangeStatusByTenant(Guid bookingId, BookingStatus newStatus, Guid tenantId)
    {
        var booking = await _bookingRepository.Get(bookingId);

        if (booking.TenantId != tenantId)
        {
            throw new ForbiddenOperationException("Tenant can only change status of their own bookings");
        }

        if (!_transitionValidator.IsTransitionLegal(booking.Status, newStatus))
        {
            throw new InvalidBookingStateTransition
                ($"Booking can't transition from state {booking.Status} to {newStatus}");
        }

        var listing = await _listingRepository.Get(booking.ListingId);
        booking.Status = newStatus;
        await RemoveBookedDateIfUnsuccessfulBook(listing, newStatus, booking);
        await _bookingRepository.SaveChangesAsync();
    }

    [Authorize(Roles = "Tenant")]
    public async Task<Booking> CreateBooking(BookingRequest request, Guid requesterId)
    {
        var listing = await _listingRepository.Get(request.ListingId);
        // ; Source - https://stackoverflow.com/a/4639057
        // ; Posted by Adam Ralph, modified by community. See post 'Timeline' for change history
        // ; Retrieved 2026-05-16, License - CC BY-SA 3.0
        var rentDuration = ((request.EndDate.Year - request.StartDate.Year) * 12) 
            + request.EndDate.Month - request.StartDate.Month + 1;

        var booking = new Booking
        {
            ListingId = request.ListingId,
            TenantId = requesterId,
            Id = Guid.NewGuid(),
            Status = BookingStatus.PendingApproval,
            Since = request.StartDate,
            Until = request.EndDate,
            Currency = listing.Currency,
            TotalCost = rentDuration * listing.Price
        };

        CheckIfBookingRequestIsValid(request, listing);

        listing.BookedDates.Add(new DateRange
        {
            Since = booking.Since,
            Until = booking.Until,
            Message = "Booked"
        });

        // To potencjalnie powinna być jedna transakcja?
        await _listingRepository.SaveChangesAsync();
        await _bookingRepository.Add(booking);

        return booking;
    }

    private static void CheckIfBookingRequestIsValid(BookingRequest request, Listing listing)
    {
        if (request.EndDate < request.StartDate)
        {
            throw new InvalidDatesException("End date can't be before start date");
        }

        if (request.StartDate < listing.AvailableFrom)
        {
            throw new DateTooEarlyException("Request date is earlier than room is available from");
        }
        
        var colidingDates = listing.UnavailableDates
            .Where(range => !(request.EndDate < range.Since || request.StartDate > range.Until));

        if (colidingDates.Any())
        {
            throw new OccupiedDateException("The room is unavailable there", [.. colidingDates]);
        }

        colidingDates = listing.BookedDates
            .Where(range => !(request.EndDate < range.Since || request.StartDate > range.Until));

        if (colidingDates.Any())
        {
            throw new OccupiedDateException("The room is already booked there", [.. colidingDates]);
        }
    }

    public async Task<BookingDto> Get(Guid bookingId)
    {
        var booking = await _bookingRepository.Get(bookingId);
        return new(booking);
    }

    private async Task RemoveBookedDateIfUnsuccessfulBook(
        Listing listing, 
        BookingStatus newStatus, 
        Booking booking
    )
    {
        if (newStatus == BookingStatus.Expired 
            || newStatus == BookingStatus.Rejected 
            || newStatus == BookingStatus.PaymentFailed
            || newStatus == BookingStatus.Cancelled
        )
        {
            listing.BookedDates.Remove(new DateRange
            {
                Since = booking.Since,
                Until = booking.Until,
                Message = "Booked"
            });
            await _listingRepository.SaveChangesAsync();
        }
    }

    public async Task<List<BookingDto>> GetAllOfUser(Guid requesterId, string role)
    {
        if (role == "TENANT")
        {
            return [.. (await _bookingRepository.GetTenants(requesterId)).Select(x => new BookingDto(x))];
        }
        if (role == "LANDLORD")
        {
            return [.. (await _bookingRepository.GetLandlords(requesterId)).Select(x => new BookingDto(x))];
        }

        throw new ForbiddenOperationException("Forbidden");
    }
}