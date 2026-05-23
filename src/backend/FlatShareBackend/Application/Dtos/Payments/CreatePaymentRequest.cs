namespace FlatShareBackend.Application.Dtos;

public class CreatePaymentRequest
{
    public required Guid BookingId;
    public required decimal TotalValue;
    public required string Currency;
}