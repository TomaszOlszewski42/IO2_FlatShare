using FlatShareBackend.Domain.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FlatShareBackend.Infrastructure.Repositories.Listings;

public interface IListingOpinionRepository
{
    Task AddOpinionAsync(ListingOpinion opinion);
    Task<IEnumerable<ListingOpinion>> GetOpinionsByListingIdAsync(Guid listingId);
}