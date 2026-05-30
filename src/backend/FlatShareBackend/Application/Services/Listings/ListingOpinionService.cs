using FlatShareBackend.Application.Dtos.Listings;
using FlatShareBackend.Domain.Exceptions;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Infrastructure.Repositories.Listings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FlatShareBackend.Application.Services.Listings;

public class ListingOpinionService : IListingOpinionService
{
    private readonly IListingOpinionRepository _repository;

    public ListingOpinionService(IListingOpinionRepository repository)
    {
        _repository = repository;
    }

    public async Task<ListingOpinionDto> AddOpinionAsync(Guid userId, AddListingOpinionRequest request)
    {
        if (request.Rating < 1 || request.Rating > 5)
        {
            throw new ListingOpinionException("Star rating must be between 1 and 5.");
        }

        var opinion = new ListingOpinion
        {
            Id = Guid.NewGuid(),
            ListingId = request.ListingId,
            UserId = userId,
            Rating = request.Rating,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddOpinionAsync(opinion);

        return new ListingOpinionDto
        {
            Id = opinion.Id,
            ListingId = opinion.ListingId,
            UserId = opinion.UserId,
            Rating = opinion.Rating,
            Comment = opinion.Comment,
            CreatedAt = opinion.CreatedAt
        };
    }

    public async Task<IEnumerable<ListingOpinionDto>> GetOpinionsForListingAsync(Guid listingId)
    {
        var opinions = await _repository.GetOpinionsByListingIdAsync(listingId);
        return opinions.Select(o => new ListingOpinionDto
        {
            Id = o.Id,
            ListingId = o.ListingId,
            UserId = o.UserId,
            Rating = o.Rating,
            Comment = o.Comment,
            CreatedAt = o.CreatedAt
        });
    }
}