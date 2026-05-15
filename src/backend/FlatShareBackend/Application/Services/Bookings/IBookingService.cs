using FlatShareBackend.Application.Dtos.Bookings;
using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Services.Bookings;

public interface IBookingService
{
    public Task<Booking> CreateBooking(BookingRequest request, Guid requesterId);
    public Task ChangeStatus(Guid listingId, BookingStatus newStatus);
    public Task<BookingStatus> GetStatus(Guid bookingId);
}
