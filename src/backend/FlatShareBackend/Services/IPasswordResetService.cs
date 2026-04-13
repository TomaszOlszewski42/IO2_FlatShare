using FlatShareBackend.Dtos.Auth;

namespace FlatShareBackend.Services
{
    public interface IPasswordResetService
    {
        Task<PasswordResetRequestResponse> RequestResetAsync(PasswordResetRequest request, CancellationToken cancellationToken = default);
        Task<PasswordResetConfirmResponse> ConfirmResetAsync(PasswordResetConfirmRequest request, CancellationToken cancellationToken = default);
    }
}