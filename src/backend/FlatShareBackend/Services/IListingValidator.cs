using FlatShareBackend.Dtos.Listings;
using FlatShareBackend.Models;

namespace FlatShareBackend.Services;

public interface IListingValidator
{
    public void Validate(Listing listing);
}
