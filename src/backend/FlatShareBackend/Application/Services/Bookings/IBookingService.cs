using FlatShareBackend.Application.Dtos.Bookings;
using FlatShareBackend.Domain.Exceptions;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Infrastructure.Repositories.Bookings;
using FlatShareBackend.Infrastructure.Repositories.Listings;
using Microsoft.AspNetCore.Authorization;

namespace FlatShareBackend.Application.Services.Bookings;

public interface IBookingService
{
    public Task<Booking> CreateBooking(BookingRequest request, Guid requesterId);
    public Task ChangeStatus(Guid listingId, BookingStatus newStatus);
    public Task<BookingStatus> GetStatus(Guid bookingId);
}

public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IListingRepository _listingRepository;

    public BookingService(IBookingRepository bookingRepository, IListingRepository listingRepository)
    {
        _bookingRepository = bookingRepository;
        _listingRepository = listingRepository;
    }

    public async Task ChangeStatus(Guid listingId, BookingStatus newStatus)
    {
        var booking = await _bookingRepository.Get(listingId);
        booking.Status = newStatus; // TODO: Walidacja przejść

        if (newStatus == BookingStatus.Expired 
            || newStatus == BookingStatus.Rejected 
            || newStatus == BookingStatus.PaymentFailed
            || newStatus == BookingStatus.Cancelled
        )
        {
            var listing = await _listingRepository.Get(booking.ListingId);
            listing.BookedDates.Remove(booking.Dates);
            await _listingRepository.SaveChangesAsync();
        }

        await _bookingRepository.SaveChangesAsync();
    }

    [Authorize(Roles = "Tenant")]
    public async Task<Booking> CreateBooking(BookingRequest request, Guid requesterId)
    {
        var booking = new Booking
        {
            ListingId = request.ListingId,
            TenantId = requesterId,
            Id = Guid.NewGuid(),
            Status = BookingStatus.PendingApproval,
            Dates = new DateRange { From = request.StartDate, To = request.EndDate }
        };

        if (request.EndDate < request.StartDate)
        {
            throw new Exception("End date can't be before start date");
        }

        var listing = await _listingRepository.Get(request.ListingId);
        
        var colidingDates = listing.UnavailableDates
            .Where(range => !(request.EndDate < range.From || request.StartDate > range.To));

        if (colidingDates.Any())
        {
            throw new OccupiedDateException("The room is unavailable there", [.. colidingDates]);
        }

        colidingDates = listing.BookedDates
            .Where(range => !(request.EndDate < range.From || request.StartDate > range.To));

        if (colidingDates.Any())
        {
            throw new OccupiedDateException("The room is already booked there", [.. colidingDates]);
        }

        listing.BookedDates.Add(new DateRange
        {
            From = booking.Dates.From,
            To = booking.Dates.To
        });

        // To potencjalnie powinna być jedna transakcja?
        await _listingRepository.SaveChangesAsync();
        await _bookingRepository.Add(booking);

        return booking;
    }

    public async Task<BookingStatus> GetStatus(Guid bookingId)
    {
        var booking = await _bookingRepository.Get(bookingId);
        return booking.Status;
    }
}