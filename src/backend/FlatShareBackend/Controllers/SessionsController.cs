using FlatShareBackend.Dtos.Auth;
using FlatShareBackend.Dtos.Common;
using FlatShareBackend.Exceptions;
using FlatShareBackend.Extensions;
using FlatShareBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlatShareBackend.Controllers
{
    [ApiController]
    [Route("api/v1/sessions")]
    public class SessionsController : ControllerBase
    {
        private readonly IAuthService _authService;

        public SessionsController(IAuthService authService)
        {
            _authService = authService;
        }

        [AllowAnonymous]
        [HttpPost]
        [ProducesResponseType(typeof(SessionResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login(
            [FromBody] LoginRequest request,
            CancellationToken cancellationToken)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ApiErrorFactory.Validation(ModelState));
            }

            try
            {
                var response = await _authService.LoginAsync(request, cancellationToken);
                return Created($"/api/v1/sessions/{response.SessionId}", response);
            }
            catch (InvalidCredentialsException ex)
            {
                return Unauthorized(ApiErrorFactory.Unauthorized(ex.Message));
            }
            catch (InactiveUserException ex)
            {
                return Unauthorized(ApiErrorFactory.Unauthorized(ex.Message));
            }
        }

        [Authorize]
        [HttpPatch("{sessionId:guid}")]
        [ProducesResponseType(typeof(SessionResponse), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Refresh(Guid sessionId, CancellationToken cancellationToken)
        {
            try
            {
                var tokenUserId = User.GetRequiredUserId();
                var tokenSessionId = User.GetRequiredSessionId();

                if (tokenSessionId != sessionId)
                {
                    return Unauthorized(ApiErrorFactory.Unauthorized("Token does not match the requested session."));
                }

                var response = await _authService.RefreshAsync(sessionId, tokenUserId, cancellationToken);
                return Created($"/api/v1/sessions/{response.SessionId}", response);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ApiErrorFactory.Unauthorized(ex.Message));
            }
            catch (InvalidSessionException ex)
            {
                return Unauthorized(ApiErrorFactory.Unauthorized(ex.Message));
            }
            catch (InactiveUserException ex)
            {
                return Unauthorized(ApiErrorFactory.Unauthorized(ex.Message));
            }
        }
    }
}