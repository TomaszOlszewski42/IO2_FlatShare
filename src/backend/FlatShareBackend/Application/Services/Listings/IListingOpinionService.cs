using FlatShareBackend.Application.Dtos.Listings;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FlatShareBackend.Application.Services.Listings;

public interface IListingOpinionService
{
    Task<ListingOpinionDto> AddOpinionAsync(Guid userId, AddListingOpinionRequest request);
    Task<IEnumerable<ListingOpinionDto>> GetOpinionsForListingAsync(Guid listingId);
}