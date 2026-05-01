using FlatShareBackend.Application.Dtos.Users;
using FlatShareBackend.Domain.Exceptions;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Infrastructure.Repositories;
using FlatShareBackend.Models;
using Microsoft.AspNetCore.Identity;

namespace FlatShareBackend.Application.Services.Users
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher<User> _passwordHasher;

        public UserService(IUserRepository userRepository, IPasswordHasher<User> passwordHasher)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
        }

        public async Task<RegisterUserResponse> RegisterAsync(RegisterUserRequest request, CancellationToken cancellationToken = default)
        {
            var normalizedEmail = request.Email.Trim().ToLowerInvariant();

            if (await _userRepository.EmailExistsAsync(normalizedEmail, cancellationToken))
            {
                throw new EmailAlreadyExistsException("Email already exists.");
            }

            var parsedRole = ParseRole(request.Role);

            var user = new User
            {
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = normalizedEmail,
                Role = parsedRole,
                Status = UserStatus.Active
            };

            user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

            await _userRepository.AddAsync(user, cancellationToken);

            return new RegisterUserResponse
            {
                Message = "New user created",
                User = new UserDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Role = ToApiRole(user.Role)
                }
            };
        }

        private static UserRole ParseRole(string role)
        {
            return role.Trim().ToUpperInvariant() switch
            {
                "LANDLORD" => UserRole.Landlord,
                "TENANT" => UserRole.Tenant,
                "ADMIN" => UserRole.Admin,
                _ => throw new InvalidRoleException("Role must be either LANDLORD, TENANT, or ADMIN.")
            };
        }

        private static string ToApiRole(UserRole role)
        {
            return role switch
            {
                UserRole.Landlord => "LANDLORD",
                UserRole.Tenant => "TENANT",
                UserRole.Admin => "ADMIN",
                _ => throw new InvalidOperationException("Unsupported user role.")
            };
        }

        public async Task<UserDto?> GetByIdAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            var user = await _userRepository.GetByIdAsync(userId, cancellationToken);

            if (user is null)
            {
                return null;
            }

            return new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = ToApiRole(user.Role)
            };
        }
    }
}