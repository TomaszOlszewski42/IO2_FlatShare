using FlatShareBackend.Dtos.Users;

namespace FlatShareBackend.Services
{
    public interface IUserService
    {
        Task<RegisterUserResponse> RegisterAsync(RegisterUserRequest request, CancellationToken cancellationToken = default);
        Task<UserDto?> GetByIdAsync(Guid userId, CancellationToken cancellationToken = default);
    }
}