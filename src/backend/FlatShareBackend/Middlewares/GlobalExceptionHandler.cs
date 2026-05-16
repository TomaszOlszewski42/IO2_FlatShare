using FlatShareBackend.Application.Dtos.Common;
using FlatShareBackend.Domain.Exceptions;
using Microsoft.AspNetCore.Diagnostics;

namespace FlatShareBackend.Middlewares
{
    public class GlobalExceptionHandler : IExceptionHandler
    {
        public async ValueTask<bool> TryHandleAsync(
            HttpContext httpContext,
            Exception exception,
            CancellationToken cancellationToken)
        {
            var statusCode = StatusCodes.Status500InternalServerError;
            var response = new ApiErrorResponse
            {
                Timestamp = DateTime.UtcNow,
                Status = statusCode,
                Error = "InternalServerError",
                Message = "An unexpected error occurred."
            };

            switch (exception)
            {
                case EmailAlreadyExistsException ex:
                    statusCode = StatusCodes.Status400BadRequest;
                    response.Status = statusCode;
                    response.Error = "ValidationError";
                    response.Message = null;
                    response.FieldErrors = new List<ApiFieldError>
                    {
                        new() { Field = "email", Message = ex.Message }
                    };
                    break;

                case InvalidRoleException ex:
                    statusCode = StatusCodes.Status400BadRequest;
                    response.Status = statusCode;
                    response.Error = "ValidationError";
                    response.Message = null;
                    response.FieldErrors = new List<ApiFieldError>
                    {
                        new() { Field = "role", Message = ex.Message }
                    };
                    break;

                case InvalidCredentialsException or InactiveUserException or InvalidSessionException or UnauthorizedAccessException:
                    statusCode = StatusCodes.Status401Unauthorized;
                    response.Status = statusCode;
                    response.Error = "Unauthorized";
                    response.Message = exception.Message;
                    break;
            }

            httpContext.Response.StatusCode = statusCode;
            httpContext.Response.ContentType = "application/json";

            await httpContext.Response.WriteAsJsonAsync(response, cancellationToken: cancellationToken);

            return true;
        }
    }
}