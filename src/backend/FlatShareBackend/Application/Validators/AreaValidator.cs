using FlatShareBackend.Domain.Exceptions;
using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Validators;

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
