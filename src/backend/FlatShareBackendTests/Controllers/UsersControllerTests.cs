using FlatShareBackend.Application.Dtos.Common;
using FlatShareBackend.Application.Dtos.Users;
using FlatShareBackend.Application.Services.Users;
using FlatShareBackend.Controllers;
using FlatShareBackend.Domain.Exceptions;
using FlatShareBackend.Exceptions;
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
            _controller = new UsersController(_userServiceMock.Object, null!);
        }

        [Theory]
        [InlineData("LANDLORD")]
        [InlineData("TENANT")]
        public async Task Register_ValidRequest_ReturnsCreated(string UserRole)
        {
            // Arrange
            var request = new RegisterUserRequest { Email = "new@test.com", FirstName = "A", LastName = "B", Password = "Pass", Role = UserRole };
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
            var request = new RegisterUserRequest { Email = "existing@test.com", FirstName = "A", LastName = "B", Password = "Pass", Role = "TENANT" };

            _userServiceMock.Setup(service => service.RegisterAsync(request, It.IsAny<CancellationToken>()))
                .ThrowsAsync(new EmailAlreadyExistsException("Email already exists."));

            // Act & Assert
            var exception = await Assert.ThrowsAsync<EmailAlreadyExistsException>(() => 
                _controller.Register(request, CancellationToken.None));
            
            Assert.Equal("Email already exists.", exception.Message);
        }
    }
}
