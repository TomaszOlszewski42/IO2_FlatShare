using Azure.Storage.Blobs;
using FlatShareBackend;
using FlatShareBackend.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Moq;
using Testcontainers.PostgreSql;
using System.Threading.Tasks;

namespace FlatShareBackend.IntegrationTests.Infrastructure
{
    public class FlatShareWebAppFactory : WebApplicationFactory<Program>, IAsyncLifetime
    {
        private readonly PostgreSqlContainer _dbContainer = new PostgreSqlBuilder("postgres:18-alpine")
            .WithDatabase("FlatShareDB")
            .WithUsername("postgres")
            .WithPassword("password")
            .Build();

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureTestServices(services =>
            {
                // Remove existing DbContext
                services.RemoveAll(typeof(DbContextOptions<AppDbContext>));

                // Add DbContext using the container's connection string
                services.AddDbContext<AppDbContext>(options =>
                {
                    options.UseNpgsql(_dbContainer.GetConnectionString());
                });

                // Mock BlobContainerClient
                services.RemoveAll(typeof(BlobContainerClient));
                var blobMock = new Mock<BlobContainerClient>();
                services.AddSingleton(blobMock.Object);
            });
        }

        public async Task InitializeAsync()
        {
            await _dbContainer.StartAsync();
        }

        public new async Task DisposeAsync()
        {
            await _dbContainer.StopAsync();
        }
    }
}
