using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Services.Bookings;

public class DefaultBookingStatusTransitionValidator : IBookingStatusTransitionValidator
{
    private readonly static Dictionary<BookingStatus, List<BookingStatus>> transitions = new()
    {
        { BookingStatus.Cancelled, [] },
        { BookingStatus.Confirmed, [BookingStatus.Cancelled] },
        { BookingStatus.Expired, [] },
        { BookingStatus.PaymentFailed, [BookingStatus.PendingPayment, BookingStatus.Cancelled] },
        { BookingStatus.PendingApproval, [BookingStatus.Expired, BookingStatus.Rejected, 
                                            BookingStatus.PendingPayment, BookingStatus.Cancelled] },
        { BookingStatus.PendingPayment, [BookingStatus.Expired, BookingStatus.Confirmed, 
                                            BookingStatus.Cancelled, BookingStatus.PaymentFailed] },
        { BookingStatus.Rejected, [] }
    };

    public bool IsTransitionLegal(BookingStatus currentStatus, BookingStatus newStatus)
    {
        if (transitions[currentStatus].Contains(newStatus))
        {
            return true;
        }
        else
        {
            return false;
        }
    }
}