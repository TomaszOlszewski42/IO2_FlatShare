using FlatShareBackend.Dtos.Auth;
using FlatShareBackend.Exceptions;
using FlatShareBackend.Models;
using FlatShareBackend.Repositories;
using FlatShareBackend.Services;
using Microsoft.AspNetCore.Identity;
using Moq;
using System;
using System.Collections.Generic;
using System.Text;

namespace FlatShareBackendTests.Services
{
    public class AuthServiceTests
    {
        private readonly Mock<IUserRepository> _userRepositoryMock;
        private readonly Mock<ISessionRepository> _sessionRepositoryMock;
        private readonly Mock<IPasswordHasher<User>> _passwordHasherMock;
        private readonly Mock<IJwtTokenService> _jwtTokenServiceMock;
        private readonly AuthService _authService;

        public AuthServiceTests()
        {
            _userRepositoryMock = new Mock<IUserRepository>();
            _sessionRepositoryMock = new Mock<ISessionRepository>();
            _passwordHasherMock = new Mock<IPasswordHasher<User>>();
            _jwtTokenServiceMock = new Mock<IJwtTokenService>();

            _authService = new AuthService(
                _userRepositoryMock.Object,
                _sessionRepositoryMock.Object,
                _passwordHasherMock.Object,
                _jwtTokenServiceMock.Object);
        }

        [Fact]
        public async Task LoginAsync_ValidCredentials_ReturnsSessionResponse()
        {
            // Arrange
            var request = new LoginRequest { Email = "test@test.com", Password = "Password123" };
            var user = new User { Id = Guid.NewGuid(), Email = "test@test.com", Status = UserStatus.Active, Role = UserRole.Tenant };

            _userRepositoryMock.Setup(repo => repo.GetByEmailAsync("test@test.com", It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            _passwordHasherMock.Setup(hasher => hasher.VerifyHashedPassword(user, It.IsAny<string>(), request.Password))
                .Returns(PasswordVerificationResult.Success);

            _jwtTokenServiceMock.Setup(jwt => jwt.GenerateToken(user, It.IsAny<UserSession>()))
                .Returns("mocked-jwt-token");

            // Act
            var result = await _authService.LoginAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("mocked-jwt-token", result.Token);
            Assert.Equal("Bearer", result.Type);
            _sessionRepositoryMock.Verify(repo => repo.AddAsync(It.IsAny<UserSession>(), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task LoginAsync_InvalidEmail_ThrowsInvalidCredentialsException()
        {
            // Arrange
            var request = new LoginRequest { Email = "wrong@test.com", Password = "Password123" };
            _userRepositoryMock.Setup(repo => repo.GetByEmailAsync("wrong@test.com", It.IsAny<CancellationToken>()))
                .ReturnsAsync((User)null);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidCredentialsException>(() => _authService.LoginAsync(request));
        }

        [Fact]
        public async Task LoginAsync_InvalidPassword_ThrowsInvalidCredentialsException()
        {
            // Arrange
            var request = new LoginRequest { Email = "test@test.com", Password = "WrongPassword" };
            var user = new User { Id = Guid.NewGuid(), Email = "test@test.com", Status = UserStatus.Active };

            _userRepositoryMock.Setup(repo => repo.GetByEmailAsync("test@test.com", It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            _passwordHasherMock.Setup(hasher => hasher.VerifyHashedPassword(user, It.IsAny<string>(), request.Password))
                .Returns(PasswordVerificationResult.Failed);

            // Act & Assert
            await Assert.ThrowsAsync<InvalidCredentialsException>(() => _authService.LoginAsync(request));
        }

        [Fact]
        public async Task LoginAsync_InactiveUser_ThrowsInactiveUserException()
        {
            // Arrange
            var request = new LoginRequest { Email = "blocked@test.com", Password = "Password123" };
            var user = new User { Id = Guid.NewGuid(), Email = "blocked@test.com", Status = UserStatus.Blocked };

            _userRepositoryMock.Setup(repo => repo.GetByEmailAsync("blocked@test.com", It.IsAny<CancellationToken>()))
                .ReturnsAsync(user);

            // Act & Assert
            await Assert.ThrowsAsync<InactiveUserException>(() => _authService.LoginAsync(request));
        }
    }
}
