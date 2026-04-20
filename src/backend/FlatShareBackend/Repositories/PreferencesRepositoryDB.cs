using FlatShareBackend.Data;
using FlatShareBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace FlatShareBackend.Repositories;

public class PreferencesRepositoryDB : IPreferencesRepository
{
    private readonly AppDbContext _dbContext;
    public PreferencesRepositoryDB(AppDbContext context)
    {
        _dbContext = context;
    }

    public async Task<UserPreferences> Get(Guid userId)
    {
        var pref = await _dbContext.UsersPreferences.Where(x => x.OwnerId == userId).FirstOrDefaultAsync();
        if (pref is null)
        {
            pref = new UserPreferences
            {
               OwnerId = userId 
            };
            _dbContext.UsersPreferences.Add(pref);
            await _dbContext.SaveChangesAsync();
        }
        return pref;
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }
}