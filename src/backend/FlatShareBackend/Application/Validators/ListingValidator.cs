using FlatShareBackend.Application.Services;
using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Validators;

public class ListingValidator : IListingValidator
{
    private readonly List<IListingRuleValidator> _rules;

    public ListingValidator(IEnumerable<IListingRuleValidator> rules)
    {
        _rules = [.. rules];
    }

    public void Validate(Listing listing)
    {
        foreach (var rule in _rules)
        {
            rule.Validate(listing);
        }
    }
}