using FlatShareBackend.Controllers;
using FlatShareBackend.Dtos.Auth;
using FlatShareBackend.Exceptions;
using FlatShareBackend.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System;
using System.Collections.Generic;
using System.Text;

namespace FlatShareBackendTests.Controllers
{
    public class SessionsControllerTests
    {
        private readonly Mock<IAuthService> _authServiceMock;
        private readonly SessionsController _controller;

        public SessionsControllerTests()
        {
            _authServiceMock = new Mock<IAuthService>();
            _controller = new SessionsController(_authServiceMock.Object);
        }

        [Fact]
        public async Task Login_ValidRequest_ReturnsCreated()
        {
            // Arrange
            var request = new LoginRequest { Email = "test@test.com", Password = "Password123" };
            var sessionResponse = new SessionResponse { Token = "token", SessionId = Guid.NewGuid() };

            _authServiceMock.Setup(service => service.LoginAsync(request, It.IsAny<CancellationToken>()))
                .ReturnsAsync(sessionResponse);

            // Act
            var result = await _controller.Login(request, CancellationToken.None);

            // Assert
            var createdResult = Assert.IsType<CreatedResult>(result);
            Assert.Equal(sessionResponse, createdResult.Value);
        }

        [Fact]
        public async Task Login_InvalidCredentials_ReturnsUnauthorized()
        {
            // Arrange
            var request = new LoginRequest { Email = "test@test.com", Password = "WrongPassword" };

            _authServiceMock.Setup(service => service.LoginAsync(request, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new InvalidCredentialsException("Invalid email or password."));

            // Act
            var result = await _controller.Login(request, CancellationToken.None);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(401, unauthorizedResult.StatusCode);
        }
    }
}
