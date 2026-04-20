using FlatShareBackend.AgregationClasses;
using FlatShareBackend.Controllers;
using FlatShareBackend.Dtos.Matches;

namespace FlatShareBackend.Services;

public interface IMatchesPagingService
{
    public Task<PagedListingsDtos> GetPage(PagingArgs args, Guid userId);
}
