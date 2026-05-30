using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Dtos.Bookings;

public class PaymentRequest
{
    public required PaymentMethod PaymentMethod { get; set; }
    public required string ReturnUrl { get; set; }
    public required string CancelUrl { get; set; }
}
