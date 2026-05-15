using FlatShareBackend.Domain.Exceptions;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Infrastructure.Data;

namespace FlatShareBackend.Infrastructure.Repositories.Bookings;

public class BookingRepository : IBookingRepository
{
    private readonly AppDbContext _dbContext;

    public BookingRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Add(Booking booking)
    {
        _dbContext.Bookings.Add(booking);
        await _dbContext.SaveChangesAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }

    public async Task<Booking> Get(Guid bookingId)
    {
        return await _dbContext.Bookings.FindAsync(bookingId) 
            ?? throw new InvalidIdException("There is no Booking with this id");
    }
}