using FlatShareBackend.Models;
using FlatShareBackend.Exceptions;

namespace FlatShareBackend.Validators;

public class AreaValidator : IListingRuleValidator
{
    public void Validate(Listing listing)
    {
        if (listing.Area < 3)
        {
            throw new ListingValidationException("Invalid area (it should be in square meters)");
        }
    }
}
