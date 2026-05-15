using FlatShareBackend.Application.Dtos.Auth;
using FlatShareBackend.Application.Dtos.Users;
using FlatShareBackend.IntegrationTests.Infrastructure;
using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;

namespace FlatShareBackend.IntegrationTests
{
    public class AuthTests : IntegrationTestBase
    {
        public AuthTests(FlatShareWebAppFactory factory) : base(factory)
        {
        }

        [Fact]
        public async Task Register_WithValidData_ShouldReturnCreated()
        {
            // Arrange
            var request = new RegisterUserRequest
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@example.com",
                Password = "SecurePassword123!",
                Role = "TENANT"
            };

            // Act
            var response = await Client.PostAsJsonAsync("/api/v1/users", request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var result = await response.Content.ReadFromJsonAsync<RegisterUserResponse>();
            result.Should().NotBeNull();
            result!.User.Email.Should().Be(request.Email);
            result.User.FirstName.Should().Be(request.FirstName);
        }

        [Fact]
        public async Task Register_WithInvalidEmail_ShouldReturnBadRequest()
        {
            // Arrange
            var request = new RegisterUserRequest
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "invalid-email",
                Password = "SecurePassword123!",
                Role = "TENANT"
            };

            // Act
            var response = await Client.PostAsJsonAsync("/api/v1/users", request);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        }

        [Fact]
        public async Task Login_WithCorrectCredentials_ShouldReturnToken()
        {
            // Arrange
            var email = "login.test@example.com";
            var password = "SecurePassword123!";
            
            var registerRequest = new RegisterUserRequest
            {
                FirstName = "Test",
                LastName = "User",
                Email = email,
                Password = password,
                Role = "TENANT"
            };
            await Client.PostAsJsonAsync("/api/v1/users", registerRequest);

            var loginRequest = new LoginRequest
            {
                Email = email,
                Password = password
            };

            // Act
            var response = await Client.PostAsJsonAsync("/api/v1/sessions", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Created);
            var result = await response.Content.ReadFromJsonAsync<SessionResponse>();
            result.Should().NotBeNull();
            result!.Token.Should().NotBeNullOrEmpty();
            result.Roles.Should().Contain("TENANT");
        }

        [Fact]
        public async Task Login_WithWrongPassword_ShouldReturnUnauthorized()
        {
            // Arrange
            var email = "wrong.pass@example.com";
            var password = "SecurePassword123!";

            var registerRequest = new RegisterUserRequest
            {
                FirstName = "Test",
                LastName = "User",
                Email = email,
                Password = password,
                Role = "TENANT"
            };
            await Client.PostAsJsonAsync("/api/v1/users", registerRequest);

            var loginRequest = new LoginRequest
            {
                Email = email,
                Password = "WrongPassword123!"
            };

            // Act
            var response = await Client.PostAsJsonAsync("/api/v1/sessions", loginRequest);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }
    }
}
