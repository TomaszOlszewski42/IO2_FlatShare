using FlatShareBackend.Domain.Exceptions;
using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Validators;

public class CurrencyValidator : IListingRuleValidator
{
    private readonly static string[] allowedCurrencies = ["PLN", "EUR"]; // TODO: jakiś enum

    public void Validate(Listing listing)
    {
        if (!allowedCurrencies.Contains(listing.Currency))
        {
            throw new ListingValidationException("Invalid currency");
        }
    }
}
