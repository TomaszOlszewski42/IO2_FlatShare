namespace FlatShareBackend.Domain.Models;

public class Booking
{
    public required Guid Id { get; set; }
    public required Guid TenantId { get; set; }
    public required Guid ListingId { get; set; }
    public required BookingStatus Status { get; set; }
    public required DateOnly Since { get; set; }
    public required DateOnly Until { get; set; }
    public required decimal TotalCost { get; set; }
    public required string Currency { get; set; }
    public Payment? Payment { get; set; }
}