using FlatShareBackend.Application.Dtos.Matches;
using FlatShareBackend.Application.Services.Matching;
using FlatShareBackend.Infrastructure.Repositories.Listings;
using FlatShareBackend.Infrastructure.Repositories.Preferences;
using LinqKit;
using Microsoft.EntityFrameworkCore;

namespace FlatShareBackend.Application.Services.MatchesPaging;

public class MatchesPagingService : IMatchesPagingService
{
    private readonly IListingRepository _listingsRepository;
    private readonly IPreferencesRepository _preferencesRepository;
    private readonly IMatchScoreCalculator _matchScoreCalculator;

    public MatchesPagingService(
        IListingRepository listingsRepository, IPreferencesRepository preferencesRepository,
        IMatchScoreCalculator calculator    
    )
    {
        _listingsRepository = listingsRepository;
        _preferencesRepository = preferencesRepository;
        _matchScoreCalculator = calculator;
    }

    public async Task<PagedMatchedListingsDto> GetPage(PagingArgs args, Guid userId)
    {
        var preferences = await _preferencesRepository.Get(userId);
        var scoreExpr = _matchScoreCalculator.GetScoreExpression(preferences);
        var query = _listingsRepository.GetQuery(new(args));
        var listingsNum = await query.CountAsync();
        var queriedListings = await query
                    .Select(x => new
                    {
                        Listing = x,
                        Score = scoreExpr.Invoke(x)
                    })
                    .OrderByDescending(x => x.Score)
                    .Skip(args.Page * args.Size)
                    .Take(args.Size)
                    .ToListAsync();
                    
        var content = queriedListings
                    .Select(x => new MatchedListingDto
                    {
                        Listing = new(x.Listing),
                        MatchScore = x.Score
                    });

        return new PagedMatchedListingsDto
        {
            Content = content,
            Page = new SearchPage
            {
                Size = args.Size,
                Number = args.Page,
                TotalElements = listingsNum,
                TotalPages = (int)Math.Ceiling(((decimal)listingsNum) / args.Size)
            }
        };
    }
}
