using FlatShareBackend.Dtos.Users;

namespace FlatShareBackend.Services;

public interface IPreferencesService
{
    public Task Update(Guid userId, UserPreferencesDto preferences);
    public Task<UserPreferencesDto> Get(Guid userId);
}
