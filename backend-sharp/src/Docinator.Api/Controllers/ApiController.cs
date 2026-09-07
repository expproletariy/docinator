using Microsoft.AspNetCore.Mvc;

namespace Docinator.Api.Controllers;

[ApiController]
[Route("api")]
public class ApiController : ControllerBase
{
    [HttpGet]
    public string GetHello() => "Hello World!";

    [HttpGet("document")]
    public DocumentDto GetDocument([FromQuery] int documentId)
    {
        return new DocumentDto
        {
            Name = "test doc",
            Pages = Enumerable.Range(1, 5)
                .Select(i => new PageDto { Number = i, ImageUrl = $"pages/{i}.png" })
                .ToList()
        };
    }
}

public record DocumentDto
{
    public string Name { get; init; } = "";
    public List<PageDto> Pages { get; init; } = new();
}

public record PageDto
{
    public int Number { get; init; }
    public string ImageUrl { get; init; } = "";
}