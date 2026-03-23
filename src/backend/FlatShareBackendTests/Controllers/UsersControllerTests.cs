using FlatShareBackend.Controllers;
using FlatShareBackend.Dtos.Common;
using FlatShareBackend.Dtos.Users;
using FlatShareBackend.Exceptions;
using FlatShareBackend.Services;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System;
using System.Collections.Generic;
using System.Text;

namespace FlatShareBackendTests.Controllers
{
    public class UsersControllerTests
    {
        private readonly Mock<IUserService> _userServiceMock;
        private readonly UsersController _controller;

        public UsersControllerTests()
        {
            _userServiceMock = new Mock<IUserService>();
            _controller = new UsersController(_userServiceMock.Object);
        }

        [Fact]
        public async Task Register_ValidRequest_ReturnsCreated()
        {
            // Arrange
            var request = new RegisterUserRequest { Email = "new@test.com", FirstName = "A", LastName = "B", Password = "Pass" };
            var response = new RegisterUserResponse { User = new UserDto { Id = Guid.NewGuid(), Email = "new@test.com" } };

            _userServiceMock.Setup(service => service.RegisterAsync(request, It.IsAny<CancellationToken>()))
                .ReturnsAsync(response);

            // Act
            var result = await _controller.Register(request, CancellationToken.None);

            // Assert
            var createdResult = Assert.IsType<CreatedResult>(result);
            Assert.Equal(response, createdResult.Value);
        }

        [Fact]
        public async Task Register_EmailExists_ReturnsBadRequestWithFieldErrors()
        {
            // Arrange
            var request = new RegisterUserRequest { Email = "existing@test.com", FirstName = "A", LastName = "B", Password = "Pass" };

            _userServiceMock.Setup(service => service.RegisterAsync(request, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new EmailAlreadyExistsException("Email already exists."));

            // Act
            var result = await _controller.Register(request, CancellationToken.None);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var apiErrorResponse = Assert.IsType<ApiErrorResponse>(badRequestResult.Value);

            Assert.Equal(400, apiErrorResponse.Status);
            Assert.Single(apiErrorResponse.FieldErrors);
            Assert.Equal("email", apiErrorResponse.FieldErrors.First().Field);
        }
    }
}
