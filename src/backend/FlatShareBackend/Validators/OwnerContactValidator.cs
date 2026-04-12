using FlatShareBackend.Models;
using FlatShareBackend.Exceptions;

namespace FlatShareBackend.Validators;

public class OwnerContactValidator : IListingRuleValidator
{
    public void Validate(Listing listing)
    {
        if (listing.OwnerContact.Length < 1)
        {
            throw new ListingValidationException("Owner contact can't be empty");
        }
    }
}
