using FlatShareBackend.Domain.Exceptions;
using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Validators;

public class PriceValidator : IListingRuleValidator
{
    public void Validate(Listing listing, List<(string field, string message)> violations)
    {
        if (listing.Price <= 0)
        {
            violations.Add(("price", "Price must be greater than 0"));
        }

        if (listing.Price * 100 != Math.Truncate(listing.Price * 100))
        {
            violations.Add(("price", "Invalid decimal places of a price"));
        }
    }
}
