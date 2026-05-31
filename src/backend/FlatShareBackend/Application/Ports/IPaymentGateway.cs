namespace FlatShareBackend.Application.Ports;

public record CreateCheckoutSessionCommand(
    Guid BookingId,
    Guid PaymentId,
    Guid UserId,
    decimal Amount,
    string Currency
);

public record CreateCheckoutSessionResult(
    string SessionId,
    string CheckoutUrl
);

public interface IPaymentGateway
{
    Task<CreateCheckoutSessionResult> CreateCheckoutSessionAsync(CreateCheckoutSessionCommand command, CancellationToken ct = default);
}
