using FlatShareBackend.Application.Dtos.Common;
using FlatShareBackend.Application.Dtos.Users;
using FlatShareBackend.Application.Services.Preferences;
using FlatShareBackend.Application.Services.Users;
using FlatShareBackend.Domain.Exceptions;
using FlatShareBackend.Infrastructure.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlatShareBackend.Controllers;

[ApiController]
[Route("api/v1/users")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IPreferencesService _preferencesService;

    public UsersController(IUserService userService, IPreferencesService preferencesService)
    {
        _userService = userService;
        _preferencesService = preferencesService;
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

        var response = await _userService.RegisterAsync(request, cancellationToken);
        return Created($"/api/v1/users/{response.User.Id}", response);
    }

    [HttpGet("{userId:guid}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid userId, CancellationToken cancellationToken)
    {
        var user = await _userService.GetByIdAsync(userId, cancellationToken);

        if (user is null)
        {
            return NotFound();
        }

        return Ok(user);
    }

    [HttpPut("me/preferences")]
    [Authorize(Roles = "TENANT")]
    public async Task<IActionResult> UpdatePreferences([FromBody] UserPreferencesDto preferencesDto, 
        IHttpContextAccessor httpAccessor)
    {
        var userId = httpAccessor.ParseUserID();
        await _preferencesService.Update(userId, preferencesDto);
        return NoContent();
    }

    [HttpGet("me/preferences")]
    [Authorize(Roles = "TENANT")]
    public async Task<IActionResult> GetPreferences(IHttpContextAccessor httpAccessor)
    {
        var userId = httpAccessor.ParseUserID();
        return Ok(await _preferencesService.Get(userId));
    }
}
