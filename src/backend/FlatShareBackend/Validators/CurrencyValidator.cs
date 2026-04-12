using FlatShareBackend.Models;
using FlatShareBackend.Exceptions;

namespace FlatShareBackend.Validators;

public class CurrencyValidator : IListingRuleValidator
{
    private readonly static string[] allowedCurrencies = ["PLN", "EUR"];

    public void Validate(Listing listing)
    {
        if (!allowedCurrencies.Contains(listing.Currency))
        {
            throw new ListingValidationException("Invalid currency");
        }
    }
}
