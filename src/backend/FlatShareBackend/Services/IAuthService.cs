using FlatShareBackend.Dtos.Auth;

namespace FlatShareBackend.Services
{
    public interface IAuthService
    {
        Task<SessionResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
        Task<SessionResponse> RefreshAsync(Guid sessionId, Guid authenticatedUserId, CancellationToken cancellationToken = default);
    }
}