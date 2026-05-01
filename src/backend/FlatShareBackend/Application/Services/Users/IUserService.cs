using FlatShareBackend.Application.Dtos.Users;

namespace FlatShareBackend.Application.Services.Users
{
    public interface IUserService
    {
        Task<RegisterUserResponse> RegisterAsync(RegisterUserRequest request, CancellationToken cancellationToken = default);
        Task<UserDto?> GetByIdAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}