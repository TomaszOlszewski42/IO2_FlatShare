using FlatShareBackend.Domain.Exceptions;
using FlatShareBackend.Domain.Models;
using Microsoft.Extensions.Options;

namespace FlatShareBackend.Application.Validators;

public class CurrencyValidator : IListingRuleValidator
{
    private readonly static string[] allowedCurrencies = ["PLN", "EUR"]; // TODO: jakiś enum

    public void Validate(Listing listing, List<(string field, string message)> violations)
    {
        if (!allowedCurrencies.Contains(listing.Currency))
        {
            violations.Add(("currency", $"Invalid currency"));    
        }
    }
}
