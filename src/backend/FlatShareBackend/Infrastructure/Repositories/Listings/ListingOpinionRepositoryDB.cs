using FlatShareBackend.Domain.Models;
using FlatShareBackend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FlatShareBackend.Infrastructure.Repositories.Listings;

public class ListingOpinionRepositoryDB : IListingOpinionRepository
{
    private readonly AppDbContext _context;

    public ListingOpinionRepositoryDB(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddOpinionAsync(ListingOpinion opinion)
    {
        await _context.ListingOpinions.AddAsync(opinion);
        await _context.SaveChangesAsync();
    }

    public async Task<IEnumerable<ListingOpinion>> GetOpinionsByListingIdAsync(Guid listingId)
    {
        return await _context.ListingOpinions
            .Where(o => o.ListingId == listingId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
    }
}