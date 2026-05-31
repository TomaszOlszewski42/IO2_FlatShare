using FlatShareBackend.API.Options;
using FlatShareBackend.Application.Ports;
using Microsoft.Extensions.Options;
using Stripe.Checkout;

namespace FlatShareBackend.Infrastructure.Stripe;

public class StripePaymentGateway : IPaymentGateway
{
    private readonly FrontendOptions _frontendOptions;

    public StripePaymentGateway(IOptions<FrontendOptions> frontendOptions)
    {
        _frontendOptions = frontendOptions.Value;
    }

    public async Task<CreateCheckoutSessionResult> CreateCheckoutSessionAsync(CreateCheckoutSessionCommand command, CancellationToken ct = default)
    {
        var options = new SessionCreateOptions
        {
            Mode = "payment",
            SuccessUrl = $"{_frontendOptions.BaseUrl}/payments/success?session_id={{CHECKOUT_SESSION_ID}}",
            CancelUrl = $"{_frontendOptions.BaseUrl}/payments/cancel",
            LineItems = new List<SessionLineItemOptions>
            {
                new SessionLineItemOptions
                {
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = command.Currency.ToLower(),
                        UnitAmountDecimal = command.Amount * 100m, // amount in grosze/cents
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = $"Rezerwacja pokoju {command.BookingId}"
                        }
                    },
                    Quantity = 1
                }
            },
            Metadata = new Dictionary<string, string>
            {
                { "bookingId", command.BookingId.ToString() },
                { "paymentId", command.PaymentId.ToString() },
                { "userId", command.UserId.ToString() }
            }
        };

        var service = new SessionService();
        var session = await service.CreateAsync(options, cancellationToken: ct);

        return new CreateCheckoutSessionResult(session.Id, session.Url);
    }
}
