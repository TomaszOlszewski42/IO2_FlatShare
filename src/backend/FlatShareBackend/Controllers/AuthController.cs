using FlatShareBackend.Dtos.Auth;
using FlatShareBackend.Dtos.Common;
using FlatShareBackend.Exceptions;
using FlatShareBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlatShareBackend.Controllers
{
    [ApiController]
    [Route("api/v1/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IPasswordResetService _passwordResetService;

        public AuthController(IPasswordResetService passwordResetService)
        {
            _passwordResetService = passwordResetService;
        }

        [AllowAnonymous]
        [HttpPost("password-reset/request")]
        [ProducesResponseType(typeof(PasswordResetRequestResponse), StatusCodes.Status202Accepted)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> RequestPasswordReset(
            [FromBody] PasswordResetRequest request,
            CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiErrorFactory.Validation(ModelState));
            }

            var response = await _passwordResetService.RequestResetAsync(request, cancellationToken);
            return Accepted(response);
        }

        [AllowAnonymous]
        [HttpPost("password-reset/confirm")]
        [ProducesResponseType(typeof(PasswordResetConfirmResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ConfirmPasswordReset(
            [FromBody] PasswordResetConfirmRequest request,
            CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiErrorFactory.Validation(ModelState));
            }

            try
            {
                var response = await _passwordResetService.ConfirmResetAsync(request, cancellationToken);
                return Ok(response);
            }
            catch (InvalidPasswordResetTokenException)
            {
                return BadRequest(ApiErrorFactory.BadRequest("Reset token is invalid or expired."));
            }
            catch (ExpiredPasswordResetTokenException)
            {
                return BadRequest(ApiErrorFactory.BadRequest("Reset token is invalid or expired."));
            }
        }
    }
}