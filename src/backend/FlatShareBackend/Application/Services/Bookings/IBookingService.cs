using FlatShareBackend.Application.Dtos.Bookings;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Infrastructure.Repositories.Bookings;

namespace FlatShareBackend.Application.Services.Bookings;

public interface IBookingService
{
    public Task<Guid> CreateBooking(BookingRequest request, Guid requesterId);
    public Task ChangeStatus(Guid listingId, BookingStatus newStatus);
    public Task<BookingStatus> GetStatus(Guid bookingId);
}

public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepository;

    public BookingService(IBookingRepository bookingRepository)
    {
        _bookingRepository = bookingRepository;
    }

    public async Task ChangeStatus(Guid listingId, BookingStatus newStatus)
    {
        var booking = await _bookingRepository.Get(listingId);
        booking.Status = newStatus; // TODO: Walidacja przejść
        await _bookingRepository.SaveChangesAsync();
    }

    public async Task<Guid> CreateBooking(BookingRequest request, Guid requesterId)
    {
        var bookingId = Guid.NewGuid();
        var booking = new Booking
        {
            ListingId = request.ListingId,
            TenantId = requesterId,
            Id = bookingId,
            Status = BookingStatus.PendingApproval
        };
        await _bookingRepository.Add(booking);
        return bookingId;
    }

    public async Task<BookingStatus> GetStatus(Guid bookingId)
    {
        var booking = await _bookingRepository.Get(bookingId);
        return booking.Status;
    }
}