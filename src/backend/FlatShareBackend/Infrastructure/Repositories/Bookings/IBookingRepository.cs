using FlatShareBackend.Application.Dtos;
using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Infrastructure.Repositories.Bookings;

public interface IBookingRepository
{
    public Task Add(Booking booking);
    public Task SaveChangesAsync();
    public Task<Booking> Get(Guid bookingId);
    public Task<List<Booking>> GetLandlords(Guid landlordId);
    public Task<List<Booking>> GetTenants(Guid tenantId);
    public Task<Booking> GetByPaymentId(Guid paymentId);
}
