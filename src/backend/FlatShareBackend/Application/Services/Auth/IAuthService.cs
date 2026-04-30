using FlatShareBackend.Application.Dtos.Auth;

namespace FlatShareBackend.Application.Services.Auth
{
    public interface IAuthService
    {
        Task<SessionResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
        Task<SessionResponse> RefreshAsync(Guid sessionId, Guid authenticatedUserId, CancellationToken cancellationToken = default);
    }
}