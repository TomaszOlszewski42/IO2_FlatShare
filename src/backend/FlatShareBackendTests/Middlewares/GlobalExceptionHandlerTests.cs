using FlatShareBackend.Application.Dtos.Common;
using FlatShareBackend.Domain.Exceptions;
using FlatShareBackend.Middlewares;
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace FlatShareBackendTests.Middlewares
{
    public class GlobalExceptionHandlerTests
    {
        private readonly GlobalExceptionHandler _handler;

        public GlobalExceptionHandlerTests()
        {
            _handler = new GlobalExceptionHandler();
        }

        private async Task<(bool handled, ApiErrorResponse? response)> ExecuteHandlerAsync(Exception exception, DefaultHttpContext context)
        {
            var responseStream = new MemoryStream();
            context.Response.Body = responseStream;

            // Uruchomienie obsługera wyjątków
            var result = await _handler.TryHandleAsync(context, exception, CancellationToken.None);

            // Pobranie i odczyt zmodyfikowanego body odpowiedzi
            context.Response.Body.Seek(0, SeekOrigin.Begin);
            var responseJson = await JsonSerializer.DeserializeAsync<ApiErrorResponse>(
                context.Response.Body, 
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            );

            return (result, responseJson);
        }

        [Fact]
        public async Task TryHandleAsync_EmailAlreadyExistsException_Returns400WithValidationError()
        {
            // Arrange
            var context = new DefaultHttpContext();
            var exception = new EmailAlreadyExistsException("This email is already taken");

            // Act
            var (handled, response) = await ExecuteHandlerAsync(exception, context);

            // Assert
            Assert.True(handled);
            Assert.Equal(StatusCodes.Status400BadRequest, context.Response.StatusCode);   
            Assert.NotNull(response);
            Assert.Equal(StatusCodes.Status400BadRequest, response.Status);
            Assert.Equal("ValidationError", response.Error);
            Assert.NotNull(response.FieldErrors);
            Assert.Contains(response.FieldErrors, e => e.Field == "email" && e.Message == "This email is already taken");
        }

        [Fact]
        public async Task TryHandleAsync_InvalidCredentialsException_Returns401Unauthorized()
        {
            // Arrange
            var context = new DefaultHttpContext();
            var exception = new InvalidCredentialsException("Invalid password");

            // Act
            var (handled, response) = await ExecuteHandlerAsync(exception, context);

            // Assert
            Assert.True(handled);
            Assert.Equal(StatusCodes.Status401Unauthorized, context.Response.StatusCode);
            Assert.NotNull(response);
            Assert.Equal(StatusCodes.Status401Unauthorized, response.Status);
            Assert.Equal("Unauthorized", response.Error);
            Assert.Equal("Invalid password", response.Message);
        }

        [Fact]
        public async Task TryHandleAsync_UnhandledGenericException_Returns500InternalServerError()
        {
            // Arrange
            var context = new DefaultHttpContext();
            var exception = new Exception("Database is down");

            // Act
            var (handled, response) = await ExecuteHandlerAsync(exception, context);

            // Assert
            Assert.True(handled);
            Assert.Equal(StatusCodes.Status500InternalServerError, context.Response.StatusCode);
            Assert.NotNull(response);
            Assert.Equal(StatusCodes.Status500InternalServerError, response.Status);
            Assert.Equal("InternalServerError", response.Error);
            
            // Unikamy rzucania wewnętrznych logów do użytkownika, w tym przypadku sprawdzamy odpowiedź zamaskowaną
            Assert.Equal("An unexpected error occurred.", response.Message); 
            Assert.Null(response.FieldErrors);
        }
    }
}