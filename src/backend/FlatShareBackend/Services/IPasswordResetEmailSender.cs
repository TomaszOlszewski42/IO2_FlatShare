namespace FlatShareBackend.Services
{
    public interface IPasswordResetEmailSender
    {
        Task SendPasswordResetAsync(string toEmail, string resetToken, DateTime expiresAtUtc, CancellationToken cancellationToken = default);
    }
}