using FlatShareBackend.Dtos.Users;
using FlatShareBackend.Exceptions;
using FlatShareBackend.Repositories;
using FlatShareBackend.Models;

namespace FlatShareBackend.Services;

public class PreferencesService : IPreferencesService
{
    private readonly IPreferencesRepository _repository;
    public PreferencesService(IPreferencesRepository repository)
    {
        _repository = repository;
    }

    public async Task<UserPreferencesDto> Get(Guid userId)
    {
        var pref = await GetOrCreate(userId);
        return new UserPreferencesDto(pref);
    }

    public async Task Update(Guid userId, UserPreferencesDto preferences)
    {
        var pref = await GetOrCreate(userId);
        pref.UpdateFromDto(preferences);
        await _repository.SaveChangesAsync();
    }

    private async Task<UserPreferences> GetOrCreate(Guid userId)
    {
        var pref = await _repository.Get(userId);

        if (pref is null)
        {
            await _repository.Add(new UserPreferences { OwnerId = userId });
            pref = await _repository.Get(userId) 
                ?? throw new DatabaseNotWorkingException("Databse not working as expected");
        }

        return pref;
    }
}