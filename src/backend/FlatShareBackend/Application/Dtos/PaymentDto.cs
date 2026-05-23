using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Dtos;

public class PaymentDto
{
    public PaymentDto(Booking booking)
    {
        var payment = booking.Payment ?? throw new NullReferenceException();
        PaymentId = payment.Id;
        BookingId = booking.Id;
        Status = payment.Status;
        TotalValue = payment.TotalValue;
        Currency = payment.Currency;
    }

    public Guid PaymentId { get; set; }
    public Guid BookingId { get; set; }
    public PaymentStatus Status { get; set; }
    public decimal TotalValue { get; set; }
    public string Currency { get; set; }
}
