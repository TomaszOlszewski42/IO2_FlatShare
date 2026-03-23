using FlatShareBackend.Dtos.Auth;
using FlatShareBackend.Exceptions;
using FlatShareBackend.Models;
using FlatShareBackend.Repositories;
using Microsoft.AspNetCore.Identity;

namespace FlatShareBackend.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly ISessionRepository _sessionRepository;
        private readonly IPasswordHasher<User> _passwordHasher;
        private readonly IJwtTokenService _jwtTokenService;

        public AuthService(
            IUserRepository userRepository,
            ISessionRepository sessionRepository,
            IPasswordHasher<User> passwordHasher,
            IJwtTokenService jwtTokenService)
        {
            _userRepository = userRepository;
            _sessionRepository = sessionRepository;
            _passwordHasher = passwordHasher;
            _jwtTokenService = jwtTokenService;
        }

        public async Task<SessionResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
        {
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();

            var user = await _userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);
            if (user is null)
            {
                throw new InvalidCredentialsException("Invalid email or password.");
            }

            if (user.Status != UserStatus.Active)
            {
                throw new InactiveUserException("User account is not active.");
            }

            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
            if (result == PasswordVerificationResult.Failed)
            {
                throw new InvalidCredentialsException("Invalid email or password.");
            }

            var session = new UserSession
            {
                UserId = user.Id,
                ExpiresAtUtc = _jwtTokenService.GetTokenExpirationUtc()
            };

            await _sessionRepository.AddAsync(session, cancellationToken);

            return new SessionResponse
            {
                Token = _jwtTokenService.GenerateToken(user, session),
                SessionId = session.Id,
                Type = "Bearer",
                ExpiresIn = _jwtTokenService.GetExpiresInSeconds(),
                Roles = new[] { user.Role.ToString().ToUpperInvariant() }
            };
        }

        public async Task<SessionResponse> RefreshAsync(Guid sessionId, Guid authenticatedUserId, CancellationToken cancellationToken = default)
        {
            var session = await _sessionRepository.GetByIdAsync(sessionId, cancellationToken);

            if (session is null)
            {
                throw new InvalidSessionException("Session does not exist.");
            }

            if (session.UserId != authenticatedUserId)
            {
                throw new InvalidSessionException("Session does not belong to the authenticated user.");
            }

            if (session.RevokedAtUtc is not null || session.ExpiresAtUtc <= DateTime.UtcNow)
            {
                throw new InvalidSessionException("Session is no longer active.");
            }

            if (session.User.Status != UserStatus.Active)
            {
                throw new InactiveUserException("User account is not active.");
            }

            session.ExpiresAtUtc = _jwtTokenService.GetTokenExpirationUtc();
            await _sessionRepository.SaveChangesAsync(cancellationToken);

            return new SessionResponse
            {
                Token = _jwtTokenService.GenerateToken(session.User, session),
                SessionId = session.Id,
                Type = "Bearer",
                ExpiresIn = _jwtTokenService.GetExpiresInSeconds(),
                Roles = new[] { session.User.Role.ToString().ToUpperInvariant() }
            };
        }
    }
}