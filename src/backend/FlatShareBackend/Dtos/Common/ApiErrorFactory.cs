using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace FlatShareBackend.Dtos.Common
{
    public static class ApiErrorFactory
    {
        public static ApiErrorResponse Validation(ModelStateDictionary modelState)
        {
            var fieldErrors = modelState
                .Where(x => x.Value?.Errors.Count > 0)
                .SelectMany(x => x.Value!.Errors.Select(e => new ApiFieldError
                {
                    Field = x.Key,
                    Message = string.IsNullOrWhiteSpace(e.ErrorMessage) ? "Invalid value." : e.ErrorMessage
                }))
                .ToList();

            return new ApiErrorResponse
            {
                Timestamp = DateTime.UtcNow,
                Status = StatusCodes.Status400BadRequest,
                Error = "ValidationError",
                FieldErrors = fieldErrors
            };
        }

        public static ApiErrorResponse BadRequest(string message) =>
            new()
            {
                Timestamp = DateTime.UtcNow,
                Status = StatusCodes.Status400BadRequest,
                Error = "BadRequest",
                Message = message
            };

        public static ApiErrorResponse Unauthorized(string message) =>
            new()
            {
                Timestamp = DateTime.UtcNow,
                Status = StatusCodes.Status401Unauthorized,
                Error = "Unauthorized",
                Message = message
            };
    }
}