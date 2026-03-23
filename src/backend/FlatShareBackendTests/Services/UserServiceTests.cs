using FlatShareBackend.Dtos.Users;
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
    public class UserServiceTests
    {
        private readonly Mock<IUserRepository> _userRepositoryMock;
        private readonly Mock<IPasswordHasher<User>> _passwordHasherMock;
        private readonly UserService _userService;

        public UserServiceTests()
        {
            _userRepositoryMock = new Mock<IUserRepository>();
            _passwordHasherMock = new Mock<IPasswordHasher<User>>();
            _userService = new UserService(_userRepositoryMock.Object, _passwordHasherMock.Object);
        }

        [Fact]
        public async Task RegisterAsync_ValidRequest_CreatesUserAndReturnsResponse()
        {
            // Arrange
            var request = new RegisterUserRequest
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@test.com",
                Password = "Password123"
            };

            _userRepositoryMock.Setup(repo => repo.EmailExistsAsync("john.doe@test.com", It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);

            _passwordHasherMock.Setup(hasher => hasher.HashPassword(It.IsAny<User>(), request.Password))
                .Returns("hashed_password");

            // Act
            var result = await _userService.RegisterAsync(request);

            // Assert
            Assert.NotNull(result);
            Assert.Equal("john.doe@test.com", result.User.Email);
            Assert.Equal("John", result.User.FirstName);
            _userRepositoryMock.Verify(repo => repo.AddAsync(It.Is<User>(u => u.Email == "john.doe@test.com" && u.PasswordHash == "hashed_password"), It.IsAny<CancellationToken>()), Times.Once);
        }

        [Fact]
        public async Task RegisterAsync_EmailAlreadyExists_ThrowsEmailAlreadyExistsException()
        {
            // Arrange
            var request = new RegisterUserRequest { Email = "existing@test.com", Password = "Password123", FirstName = "A", LastName = "B" };

            _userRepositoryMock.Setup(repo => repo.EmailExistsAsync("existing@test.com", It.IsAny<CancellationToken>()))
                .ReturnsAsync(true);

            // Act & Assert
            await Assert.ThrowsAsync<EmailAlreadyExistsException>(() => _userService.RegisterAsync(request));
        }
    }
}
