using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Dtos;

public record class BookingDto
{
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
        PaymentStatus = "";
        if (booking.Status == BookingStatus.Confirmed)
        {
            PaymentStatus = "SUCCEEDED";
        }
        else
        {
            PaymentStatus = "PENDING";
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
    public string PaymentStatus { get; set; }
}
