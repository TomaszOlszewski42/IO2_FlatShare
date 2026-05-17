using FlatShareBackend.Application.Dtos.Auth;
using FlatShareBackend.Application.Dtos.Users;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Models;
using FlatShareBackend.Infrastructure.Data;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Identity;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Xunit;

namespace FlatShareBackend.IntegrationTests.Infrastructure
{
    public abstract class IntegrationTestBase : IClassFixture<FlatShareWebAppFactory>
    {
        protected readonly FlatShareWebAppFactory Factory;
        protected readonly HttpClient Client;
        protected readonly IServiceScope Scope;
        protected readonly AppDbContext DbContext;

        protected IntegrationTestBase(FlatShareWebAppFactory factory)
        {
            Factory = factory;
            Client = factory.CreateClient();
            Scope = factory.Services.CreateScope();
            DbContext = Scope.ServiceProvider.GetRequiredService<AppDbContext>();
        }

        protected async Task AuthenticateAsync(string email = "test@example.com", string role = "TENANT")
        {
            var password = "SecurePassword123!";
            
            if (role == "ADMIN")
            {
                // We add ADMIN user manually
                var hasher = Scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>();
                var admin = new User
                {
                    Id = Guid.NewGuid(),
                    FirstName = "Admin",
                    LastName = "User",
                    Email = email.ToLowerInvariant(),
                    Role = UserRole.Admin,
                    Status = UserStatus.Active,
                    CreatedAtUtc = DateTime.UtcNow
                };
                admin.PasswordHash = hasher.HashPassword(admin, password);
                
                DbContext.Users.Add(admin);
                await DbContext.SaveChangesAsync();
            }
            else
            {
                // Register via API for regular roles
                var registerRequest = new RegisterUserRequest
                {
                    FirstName = "Test",
                    LastName = "User",
                    Email = email,
                    Password = password,
                    Role = role
                };
                await Client.PostAsJsonAsync("/api/v1/users", registerRequest);
            }

            // Login to get token
            var loginRequest = new LoginRequest
            {
                Email = email,
                Password = password
            };
            var response = await Client.PostAsJsonAsync("/api/v1/sessions", loginRequest);
            var result = await response.Content.ReadFromJsonAsync<SessionResponse>();

            Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", result!.Token);
        }
    }
}
