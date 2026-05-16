using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Services.Bookings;

public interface IBookingStatusTransitionValidator
{
    public bool IsTransitionLegal(BookingStatus currentStatus, BookingStatus newStatus);
}
