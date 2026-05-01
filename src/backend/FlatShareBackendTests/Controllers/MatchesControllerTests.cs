using System.Collections;
using System.Security.Claims;
using FlatShareBackend.Application.Dtos.Matches;
using FlatShareBackend.Application.Services.MatchesPaging;
using FlatShareBackend.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace FlatShareBackendTests.Controllers;

public class MatchesControllerTestData : IEnumerable<object[]>
{
    public IEnumerator<object[]> GetEnumerator()
    {
        yield return new object[] 
        {
            new PagingArgs
            {
                Page = 0,
                Size = 0,
                City = "Shurima"
            }
        };
        yield return new object[] 
        {
            new PagingArgs
            {
                Page = 0,
                Size = 0,
                PetsAllowed = true,
                NonSmokingOnly = false
            }
        };
        yield return new object[] 
        {
            new PagingArgs
            {
                Page = 0,
                Size = 0,
                City = "Shurima",
                MinArea = 12.34m
            }
        };
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}

public class MatchesControllerTests
{
    private readonly Mock<IMatchesPagingService> _matchesPagingServiceMock;
    private readonly Mock<IHttpContextAccessor> _contextAccessorMock;
    private readonly Guid _testUserId;
    private readonly MatchesController _controller;

    public MatchesControllerTests()
    {
        _matchesPagingServiceMock = new Mock<IMatchesPagingService>();
        _contextAccessorMock = new Mock<IHttpContextAccessor>();
        _testUserId = Guid.NewGuid();

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, _testUserId.ToString()),
            new(ClaimTypes.Role, "TENANT")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        var httpContext = new DefaultHttpContext { User = claimsPrincipal };
        _contextAccessorMock.Setup(a => a.HttpContext).Returns(httpContext);

        _controller = new MatchesController(_matchesPagingServiceMock.Object, _contextAccessorMock.Object);
    }

    [Theory]
    [ClassData(typeof(MatchesControllerTestData))]
    public async Task Get_IllThinkOfNameLater(PagingArgs args)
    {
        _matchesPagingServiceMock.Setup(x => x.GetPage(args, _testUserId)).ReturnsAsync(new PagedMatchedListingsDto
        {
            Content = [],
            Page = new SearchPage
            {
                Size = 0,
                Number = 0,
                TotalElements = 0,
                TotalPages = 0
            }
        });

        var result = await _controller.Get(args);

        Assert.IsType<OkObjectResult>(result);
    }
}