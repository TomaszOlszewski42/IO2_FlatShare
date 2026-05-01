using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Infrastructure.Repositories.Preferences;

public interface IPreferencesRepository
{
    public Task<UserPreferences> Get(Guid userId);
    public Task SaveChangesAsync();
}
