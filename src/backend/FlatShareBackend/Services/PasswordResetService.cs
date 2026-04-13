using System.Security.Cryptography;
using System.Text;
using FlatShareBackend.Dtos.Auth;
using FlatShareBackend.Exceptions;
using FlatShareBackend.Models;
using FlatShareBackend.Options;
using FlatShareBackend.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;

namespace FlatShareBackend.Services
{
    public class PasswordResetService : IPasswordResetService
    {
        private static readonly PasswordResetRequestResponse NeutralResponse = new();

        private readonly IUserRepository _userRepository;
        private readonly IPasswordResetTokenRepository _passwordResetTokenRepository;
        private readonly ISessionRepository _sessionRepository;
        private readonly IPasswordResetEmailSender _passwordResetEmailSender;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly PasswordResetOptions _options;
        private readonly ILogger<PasswordResetService> _logger;

        public PasswordResetService(
            IUserRepository userRepository,
            IPasswordResetTokenRepository passwordResetTokenRepository,
            ISessionRepository sessionRepository,
            IPasswordResetEmailSender passwordResetEmailSender,
            IPasswordHasher<User> passwordHasher,
            IOptions<PasswordResetOptions> options,
            ILogger<PasswordResetService> logger)
        {
            _userRepository = userRepository;
            _passwordResetTokenRepository = passwordResetTokenRepository;
            _sessionRepository = sessionRepository;
            _passwordResetEmailSender = passwordResetEmailSender;
            _passwordHasher = passwordHasher;
            _options = options.Value;
            _logger = logger;
        }

        public async Task<PasswordResetRequestResponse> RequestResetAsync(
            PasswordResetRequest request,
            CancellationToken cancellationToken = default)
        {
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();
            var user = await _userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);

            if (user is null || user.Status != UserStatus.Active)
            {
                return NeutralResponse;
            }

            var rawToken = GenerateRawToken();
            var token = new PasswordResetToken
            {
                UserId = user.Id,
                TokenHash = HashToken(rawToken),
                ExpiresAtUtc = DateTime.UtcNow.AddMinutes(_options.TokenTtlMinutes)
            };

            await _passwordResetTokenRepository.AddAsync(token, cancellationToken);

            try
            {
                await _passwordResetEmailSender.SendPasswordResetAsync(user.Email, rawToken, token.ExpiresAtUtc, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send password reset email.");
            }

            return NeutralResponse;
        }

        public async Task<PasswordResetConfirmResponse> ConfirmResetAsync(
            PasswordResetConfirmRequest request,
            CancellationToken cancellationToken = default)
        {
            var tokenHash = HashToken(request.ResetToken.Trim());
            var tokenEntity = await _passwordResetTokenRepository.GetByTokenHashAsync(tokenHash, cancellationToken);

            if (tokenEntity is null || tokenEntity.UsedAtUtc is not null)
            {
                throw new InvalidPasswordResetTokenException("Reset token is invalid.");
            }

            if (tokenEntity.ExpiresAtUtc <= DateTime.UtcNow)
            {
                throw new ExpiredPasswordResetTokenException("Reset token has expired.");
            }

            if (tokenEntity.User.Status != UserStatus.Active)
            {
                throw new InvalidPasswordResetTokenException("Reset token is invalid.");
            }

            tokenEntity.User.PasswordHash = _passwordHasher.HashPassword(tokenEntity.User, request.NewPassword);
            tokenEntity.UsedAtUtc = DateTime.UtcNow;

            await _sessionRepository.RevokeActiveSessionsByUserIdAsync(tokenEntity.UserId, DateTime.UtcNow, cancellationToken);
            await _userRepository.SaveChangesAsync(cancellationToken);

            return new PasswordResetConfirmResponse();
        }

        private static string GenerateRawToken()
        {
            var bytes = RandomNumberGenerator.GetBytes(32);
            return WebEncoders.Base64UrlEncode(bytes);
        }

        private static string HashToken(string token)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
            return Convert.ToHexString(bytes);
        }
    }
}