using FlatShareBackend.Domain.Exceptions;
using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Validators;

public class AreaValidator : IListingRuleValidator
{
    public void Validate(Listing listing, List<(string field, string message)> vialotions)
    {
        if (listing.Area < 3)
        {
            vialotions.Add(("area", "Nonsensical area size, its below 3 sqr meters."));
        }
    }
}
