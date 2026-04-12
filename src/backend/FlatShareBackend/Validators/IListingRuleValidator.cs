using FlatShareBackend.Models;

namespace FlatShareBackend.Validators;

public interface IListingRuleValidator
{
    public void Validate(Listing listing);
}
