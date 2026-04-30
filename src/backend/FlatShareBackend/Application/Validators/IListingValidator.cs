using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Application.Services;

public interface IListingValidator
{
    public void Validate(Listing listing);
}
