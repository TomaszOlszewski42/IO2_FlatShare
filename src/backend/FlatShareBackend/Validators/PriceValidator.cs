using FlatShareBackend.Models;
using FlatShareBackend.Exceptions;

namespace FlatShareBackend.Validators;

public class PriceValidator : IListingRuleValidator
{
    public void Validate(Listing listing)
    {
        if (listing.Price <= 0)
        {
            throw new ListingValidationException("Price must be greater than 0");
        }

        if (listing.Price * 100 != Math.Truncate(listing.Price * 100))
        {
            throw new ListingValidationException("Invalid decimal places of a price");
        }
    }
}
