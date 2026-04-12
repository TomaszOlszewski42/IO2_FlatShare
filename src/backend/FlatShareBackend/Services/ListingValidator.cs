using FlatShareBackend.Dtos.Listings;
using FlatShareBackend.Exceptions;
using FlatShareBackend.Models;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore.Query.Internal;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.ComponentModel.DataAnnotations;
using FlatShareBackend.Validators;

namespace FlatShareBackend.Services;

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