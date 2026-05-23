using FlatShareBackend.Application.Dtos;
using FlatShareBackend.Application.Dtos.Bookings;
using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Services.Bookings;

public interface IBookingService
{
    public Task<Booking> CreateBooking(BookingRequest request, Guid requesterId);
    public Task ChangeStatusByTenant(Guid bookingId, BookingStatus newStatus, Guid tenantId);
    public Task ChangeStatusByLandlord(Guid bookingId, BookingStatus newStatus, Guid landlordId);
    public Task<BookingDto> Get(Guid bookingId);
    public Task<List<BookingDto>> GetAllOfUser(Guid requesterId, string role);
    public Task<PaymentDto> GetPaymentByPaymentId(Guid paymentId);
    public Task<PaymentDto> GetPaymentByBookingId(Guid bookingId);
    public Task CreatePayment(CreatePaymentRequest request);
}
