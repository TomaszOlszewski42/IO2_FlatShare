using FlatShareBackend.Domain.Models;

namespace FlatShareBackend.Infrastructure.Repositories;

public interface IPreferencesRepository
{
    public Task<UserPreferences> Get(Guid userId);
    public Task SaveChangesAsync();
}
