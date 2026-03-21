using FlatShareBackend.Dtos.Common;
using FlatShareBackend.Dtos.Users;
using FlatShareBackend.Exceptions;
using FlatShareBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlatShareBackend.Controllers
{
    [ApiController]
    [Route("api/v1/users")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [AllowAnonymous]
        [HttpPost]
        [ProducesResponseType(typeof(RegisterUserResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register(
            [FromBody] RegisterUserRequest request,
            CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiErrorFactory.Validation(ModelState));
            }

            try
            {
                var response = await _userService.RegisterAsync(request, cancellationToken);
                return Created($"/api/v1/users/{response.User.Id}", response);
            }
            catch (EmailAlreadyExistsException ex)
            {
                return BadRequest(new ApiErrorResponse
                {
                    Timestamp = DateTime.UtcNow,
                    Status = StatusCodes.Status400BadRequest,
                    Error = "ValidationError",
                    FieldErrors = new List<ApiFieldError>
                {
                    new()
                    {
                        Field = "email",
                        Message = ex.Message
                    }
                }
                });
            }
        }
    }
}