using FlatShareBackend.Application.Dtos.Users;

namespace FlatShareBackend.Application.Services.Preferences;

public interface IPreferencesService
{
    public Task Update(Guid userId, UserPreferencesDto preferences);
    public Task<UserPreferencesDto> Get(Guid userId);
}
