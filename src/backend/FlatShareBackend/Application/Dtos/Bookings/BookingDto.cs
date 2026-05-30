using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Dtos.Bookings;

public record class BookingDto
{
    public BookingDto() { }

    public BookingDto(Booking booking)
    {
        Id = booking.Id;
        TenantId = booking.TenantId;
        ListingId = booking.ListingId;
        Status = booking.Status;
        Since = booking.Since;
        Until = booking.Until;
        TotalCost = booking.TotalCost;
        Currency = booking.Currency;
        PaymentId = "";
        if (booking.Payment != null)
        {
            PaymentId = booking.Payment.Id.ToString();
        }
    }

    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid ListingId { get; set; }
    public BookingStatus Status { get; set; }
    public DateOnly Since { get; set; }
    public DateOnly Until { get; set; }
    public decimal TotalCost { get; set; }
    public string Currency { get; set; }
    public string PaymentId { get; set; }
}
