using FlatShareBackend.Application.Dtos.Matches;
using FlatShareBackend.Application.Services.MatchesPaging;
using FlatShareBackend.Infrastructure.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlatShareBackend.API.Controllers;

[ApiController]
[Route("api/v1/rentals")]
public class RentalsController : ControllerBase
{

    public RentalsController()
    {
    }

    [HttpPost()]
    public async Task<IActionResult> Create()
    {
        throw new NotImplementedException();
    }

    [HttpPost("{rentalId}/accept")]
    public async Task<IActionResult> Accept()
    {
        throw new NotImplementedException();
    }

    [HttpPost("{rentalId}/reject")]
    public async Task<IActionResult> Reject()
    {
        throw new NotImplementedException();
    }

    [HttpPost("{rentalId}/cancel")]
    public async Task<IActionResult> Cancel()
    {
        throw new NotImplementedException();
    }

    [HttpPost("{rentalId}/pay")]
    public async Task<IActionResult> Pay()
    {
        throw new NotImplementedException();
    }


    [HttpGet("{rentalId}")]
    public async Task<IActionResult> GetStatus()
    {
        throw new NotImplementedException();
    }
}
