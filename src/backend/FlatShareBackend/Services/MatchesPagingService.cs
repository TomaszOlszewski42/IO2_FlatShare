using FlatShareBackend.AgregationClasses;
using FlatShareBackend.Dtos.Listings;
using FlatShareBackend.Dtos.Matches;
using FlatShareBackend.Exceptions;
using FlatShareBackend.Models;
using FlatShareBackend.Repositories;

namespace FlatShareBackend.Services;

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
        var filteredListings = (await _listingsRepository.QueryListing(new(args)))
                                .Select(x => new MatchedListingDto 
                                    {
                                        Listing = new ListingDto(x),
                                        MatchScore = _matchScoreCalculator.Calculate(x, preferences)
                                    })
                                .OrderBy(x => x.MatchScore);
        var listingsNum = filteredListings.Count();
        var page = filteredListings.Chunk(args.Size).ElementAtOrDefault(args.Page) ?? [];
        return new PagedMatchedListingsDto
        {
            Content = page,
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
