namespace FlatShareBackend.Domain.Models;

public class Payment
{
    public required Guid Id;
    public required PaymentStatus Status;
    public required decimal TotalValue;
    public required string Currency;
}