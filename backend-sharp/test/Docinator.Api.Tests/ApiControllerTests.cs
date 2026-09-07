using System.Net.Http.Json;
using Docinator.Api.Controllers;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Docinator.Api.Tests;

public class ApiControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ApiControllerTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetHello_ReturnsHelloWorld()
    {
        var response = await _client.GetStringAsync("/api");

        Assert.Equal("Hello World!", response);
    }

    [Fact]
    public async Task GetDocument_ReturnsTestDocument()
    {
        var document = await _client.GetFromJsonAsync<DocumentDto>("/api/document?documentId=1");

        Assert.NotNull(document);
        Assert.Equal("test doc", document!.Name);
        Assert.Equal(5, document.Pages.Count);
        Assert.Equal("pages/1.png", document.Pages[0].ImageUrl);
        Assert.Equal("pages/5.png", document.Pages[4].ImageUrl);
    }

    [Fact]
    public async Task GetDocument_WithInvalidId_ReturnsBadRequest()
    {
        var response = await _client.GetAsync("/api/document?documentId=abc");

        Assert.Equal(System.Net.HttpStatusCode.BadRequest, response.StatusCode);
    }
}