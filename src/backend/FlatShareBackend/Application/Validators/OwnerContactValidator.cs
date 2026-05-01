using FlatShareBackend.Domain.Exceptions;
using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Validators;

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
