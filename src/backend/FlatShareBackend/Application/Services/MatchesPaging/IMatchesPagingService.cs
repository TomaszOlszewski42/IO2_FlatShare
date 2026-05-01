using FlatShareBackend.Application.Dtos.Matches;

namespace FlatShareBackend.Application.Services.MatchesPaging;

public interface IMatchesPagingService
{
    public Task<PagedMatchedListingsDto> GetPage(PagingArgs args, Guid userId);
}
