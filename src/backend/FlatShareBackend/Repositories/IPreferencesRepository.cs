using FlatShareBackend.Data;
using FlatShareBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace FlatShareBackend.Repositories;

public interface IPreferencesRepository
{
    public Task Add(UserPreferences preferences);
    public Task<UserPreferences?> Get(Guid userId);
    public Task SaveChangesAsync();
}

public class PreferencesRepositoryDB : IPreferencesRepository
{
    private readonly AppDbContext _dbContext;
    public PreferencesRepositoryDB(AppDbContext context)
    {
        _dbContext = context;
    }

    public async Task Add(UserPreferences preferences)
    {
        _dbContext.UsersPreferences.Add(preferences);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<UserPreferences?> Get(Guid userId)
    {
        return await _dbContext.UsersPreferences.Where(x => x.OwnerId == userId).FirstOrDefaultAsync();
    }

    public async Task SaveChangesAsync()
    {
        await _dbContext.SaveChangesAsync();
    }
}