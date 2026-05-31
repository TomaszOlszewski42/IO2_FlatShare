using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using FlatShareBackend.Application.Services;
using FlatShareBackend.Application.Services.Auth;
using FlatShareBackend.Application.Services.FilesManagment;
using FlatShareBackend.Application.Services.Listings;
using FlatShareBackend.Application.Services.MatchesPaging;
using FlatShareBackend.Application.Services.Matching;
using FlatShareBackend.Application.Services.Preferences;
using FlatShareBackend.Application.Services.Users;
using FlatShareBackend.Application.Validators;
using FlatShareBackend.Domain.Models;
using FlatShareBackend.Infrastructure.Data;
using FlatShareBackend.Infrastructure.Repositories;
using FlatShareBackend.Infrastructure.Repositories.Listings;
using FlatShareBackend.Infrastructure.Repositories.Preferences;
using FlatShareBackend.Infrastructure.Repositories.Sessions;
using FlatShareBackend.Infrastructure.Repositories.Users;
using FlatShareBackend.Options;
using FlatShareBackend.API.Options;
using FlatShareBackend.Application.Ports;
using FlatShareBackend.Application.Services.Payments;
using FlatShareBackend.Infrastructure.Stripe;
using FlatShareBackend.Repositories;
using Stripe;
using FlatShareBackend.Middlewares;
using LinqKit;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.Reflection.Metadata;
using System.Text;
using FlatShareBackend.Infrastructure.Repositories.Bookings;
using FlatShareBackend.Application.Services.Bookings;

namespace FlatShareBackend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
            builder.Services.AddProblemDetails();

            builder.Services.Configure<BlobOptions>(builder.Configuration.GetSection("Blob"));
            builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));

            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
                    .WithExpressionExpanding());

            var jwtOptions = builder.Configuration
                .GetSection(JwtOptions.SectionName)
                .Get<JwtOptions>() ?? throw new InvalidOperationException("JWT configuration is missing.");

            builder.Services
                .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.RequireHttpsMetadata = false;
                    options.SaveToken = false;
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateIssuerSigningKey = true,
                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero,
                        ValidIssuer = jwtOptions.Issuer,
                        ValidAudience = jwtOptions.Audience,
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(jwtOptions.Key))
                    };
                });

            builder.Services.AddAuthorization();

            builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
            builder.Services.AddScoped<IUserRepository, UserRepository>();
            builder.Services.AddScoped<ISessionRepository, SessionRepository>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
            builder.Services.AddScoped<IListingRepository, ListingRepositoryDB>();
            builder.Services.AddScoped<IListingService, ListingService>();
            builder.Services.AddScoped<IViolationReportRepository, ViolationReportRepository>();
            builder.Services.AddScoped<IModerationService, ModerationService>();
            builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            builder.Services.AddScoped<IListingValidator, ListingValidator>();

            // Validation rules that will be used by IListingValidator
            builder.Services.AddTransient<IListingRuleValidator, AreaValidator>();
            builder.Services.AddTransient<IListingRuleValidator, CurrencyValidator>();
            builder.Services.AddTransient<IListingRuleValidator, OwnerContactValidator>();
            builder.Services.AddTransient<IListingRuleValidator, PriceValidator>();
            // --------------------------------------------

            builder.Services.AddTransient<IPreferencesService, PreferencesService>();
            builder.Services.AddTransient<IPreferencesRepository, PreferencesRepositoryDB>();

            builder.Services.AddTransient<IFilesService, FileServiceBlob>();

            builder.Services.AddTransient<IMatchesPagingService, MatchesPagingService>();
            builder.Services.AddTransient<IMatchScoreCalculator, DefaultMatchScoreCalculator>();

            builder.Services.AddScoped<IListingOpinionRepository, ListingOpinionRepositoryDB>();
            builder.Services.AddScoped<IListingOpinionService, ListingOpinionService>();
            builder.Services.AddScoped<IBookingRepository, BookingRepository>();
            builder.Services.AddScoped<IBookingService, BookingService>();
            builder.Services.AddScoped<IBookingStatusTransitionValidator, DefaultBookingStatusTransitionValidator>();

            builder.Services.AddSingleton(serviceProvider =>
            {
                var options = serviceProvider.GetRequiredService<IOptions<BlobOptions>>().Value;
                return new BlobContainerClient(options.ConnectionString, options.ContainerName);
            });

            builder.Services.Configure<StripeOptions>(builder.Configuration.GetSection(StripeOptions.SectionName));
            builder.Services.Configure<FrontendOptions>(builder.Configuration.GetSection(FrontendOptions.SectionName));

            var stripeOptions = builder.Configuration.GetSection(StripeOptions.SectionName).Get<StripeOptions>();
            if (stripeOptions != null && !string.IsNullOrEmpty(stripeOptions.SecretKey))
            {
                StripeConfiguration.ApiKey = stripeOptions.SecretKey;
            }

            builder.Services.AddScoped<IPaymentGateway, StripePaymentGateway>();
            builder.Services.AddScoped<IPaymentService, PaymentService>();

            var app = builder.Build();

            app.UseExceptionHandler();

            using (var scope = app.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                dbContext.Database.Migrate();
            }

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
