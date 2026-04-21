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

    public async Task<PagedListingsDtos> GetPage(PagingArgs args, Guid userId)
    {
        var filteredListings = await _listingsRepository.QueryListing(new(args));
        var preferences = await _preferencesRepository.Get(userId);
        var sorted = filteredListings.OrderBy(x => _matchScoreCalculator.Calculate(x, preferences));
        var listingsNum = sorted.Count();
        var page = (sorted.Chunk(args.Size).ElementAtOrDefault(args.Page) 
            ?? [])
            .Select(x => new ListingDto(x));
        return new PagedListingsDtos
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
