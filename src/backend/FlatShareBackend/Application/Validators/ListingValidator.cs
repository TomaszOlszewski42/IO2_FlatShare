using FlatShareBackend.Application.Services;
using FlatShareBackend.Domain.Exceptions;
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
        List<(string field, string message)> violations = [];
        foreach (var rule in _rules)
        {
            rule.Validate(listing, violations);
        }

        if (violations.Count != 0)
        {
            throw new ListingValidationException("Validation errorr", violations);
        }
    }
}