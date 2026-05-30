using FlatShareBackend.Domain.Exceptions;
using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Validators;

public class OwnerContactValidator : IListingRuleValidator
{
    public void Validate(Listing listing, List<(string field, string message)> violations)
    {
        if (listing.OwnerContact.Length < 1)
        {
            violations.Add(("ownerContact", "Owner contact can't be empty"));
        }
    }
}
