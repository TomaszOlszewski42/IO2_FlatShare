using FlatShareBackend.API.Controllers;
using FlatShareBackend.Application.Dtos.Common;
using FlatShareBackend.Domain.Exceptions;
using FlatShareBackend.Domain.Models;
using Microsoft.AspNetCore.Diagnostics;

namespace FlatShareBackend.Middlewares;

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
                response.Error = "ValidationError";
                response.Message = null;
                response.FieldErrors =
                [
                    new() { Field = "email", Message = ex.Message }
                ];
                break;
            case InvalidRoleException ex:
                statusCode = StatusCodes.Status400BadRequest;
                response.Error = "ValidationError";
                response.Message = null;
                response.FieldErrors =
                [
                    new() { Field = "role", Message = ex.Message }
                ];
                break;
            case InvalidCredentialsException or InactiveUserException or InvalidSessionException 
            or UnauthorizedAccessException:
                statusCode = StatusCodes.Status401Unauthorized;
                response.Error = "Unauthorized";
                response.Message = exception.Message;
                break;
            case ForbiddenOperationException or UnauthorizedDatabaseOperation:
                statusCode = StatusCodes.Status403Forbidden;
                response.Error = "Forbiddedn";
                response.Message = exception.Message;
                break;
            case OccupiedDateException:
                statusCode = StatusCodes.Status409Conflict;
                response.Error = "Room already occupied then";
                response.Message = exception.Message;
                break;
            case InvalidDatesException or DateTooEarlyException:
                statusCode = StatusCodes.Status400BadRequest;
                response.Error = "Invalid dates";
                response.Message = exception.Message;
                break;
            case InvalidBookingStateTransition:
                statusCode = StatusCodes.Status400BadRequest;
                response.Error = "Invalid transition";
                response.Message = exception.Message;
                break;
            case InvalidIdException:
                statusCode = StatusCodes.Status404NotFound;
                response.Error = "Id not found";
                response.Message = null;
                break;
            case ListingValidationException ex:
                statusCode = StatusCodes.Status400BadRequest;
                response.Error = "Validation error";
                response.Message = exception.Message;
                response.FieldErrors = [.. ex.FieldErrors
                    .Select(x => new ApiFieldError { Field = x.field, Message = x.message })
                    ];
                break;
            case InvalidPageNumberException:
                statusCode = StatusCodes.Status400BadRequest;
                response.Error = "Invalid page number";
                response.Message = exception.Message;
                break;
            case NullPaymentException:
                statusCode = StatusCodes.Status400BadRequest;
                response.Error = "No payment started for this booking";
                response.Message = exception.Message;
                break;
            case UserNotFoundException:
                statusCode = StatusCodes.Status400BadRequest;
                response.Error = "No user with this id";
                response.Message = exception.Message;
                break;
            case CantCancellException:
                var cancellationResponse = new
                {
                    error = "CancellationNotAllowed",
                    timestamp = DateTime.Now,
                    message = exception.Message,
                    bookingStatus = BookingStatus.Confirmed
                };
                await FinalizeAnswer(cancellationResponse, StatusCodes.Status409Conflict, httpContext, cancellationToken);
                return true;
            case UnavailabilityErrorException or ListingOpinionException:
                statusCode = StatusCodes.Status400BadRequest;
                response.Error = "Validation error";
                response.Message = exception.Message;
                break;
        }

        response.Status = statusCode;
        await FinalizeAnswer(response, statusCode, httpContext, cancellationToken);

        return true;
    }

    private static async Task FinalizeAnswer<T>(
        T response, int statusCode, HttpContext httpContext, CancellationToken token
    )
    {
        httpContext.Response.StatusCode = statusCode;
        httpContext.Response.ContentType = "application/json";
        await httpContext.Response.WriteAsJsonAsync(response, cancellationToken: token);
    }
}