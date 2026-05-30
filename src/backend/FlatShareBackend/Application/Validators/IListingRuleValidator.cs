using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Validators;

public interface IListingRuleValidator
{
    public void Validate(Listing listing, List<(string field, string message)> violations);
}
