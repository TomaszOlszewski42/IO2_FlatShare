using FlatShareBackend.Application.Dtos;
using FlatShareBackend.Application.Dtos.Bookings;
using FlatShareBackend.Application.Dtos.Payments;
using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Services.Bookings;

public interface IBookingService
{
    public Task<Booking> CreateBooking(BookingRequest request, Guid requesterId);
    public Task ChangeStatusByTenant(Guid bookingId, BookingStatus newStatus, Guid tenantId);
    public Task ChangeStatusByLandlord(Guid bookingId, BookingStatus newStatus, Guid landlordId);
    public Task<BookingDto> Get(Guid bookingId);
    public Task<List<BookingDto>> GetAllOfUser(Guid requesterId, string role);
    public Task<PaymentDto> GetPaymentByPaymentId(Guid paymentId, Guid requesterId, string requesterRole);
    public Task<PaymentDto> GetPaymentByBookingId(Guid bookingId, Guid requesterId, string requesterRole);
    public Task CreatePayment(CreatePaymentRequest request);
}
