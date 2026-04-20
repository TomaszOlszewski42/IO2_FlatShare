using FlatShareBackend.Models;

namespace FlatShareBackend.Repositories;

public interface IPreferencesRepository
{
    public Task<UserPreferences> Get(Guid userId);
    public Task SaveChangesAsync();
}
