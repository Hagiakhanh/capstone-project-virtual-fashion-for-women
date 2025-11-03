using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.API.Controllers;

[ApiController]
[Route("api/recommendation")]
public class RecommendationController : ControllerBase
{
    private readonly IRecommendationService _recommendationService;
    
    public RecommendationController(IRecommendationService recommendationService)
    {
        _recommendationService = recommendationService;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetRecommendations([FromQuery] int topN)
    {
        var recommendations = await _recommendationService
            .GetHybridRecommendationsAsync(topN);
            
        return Ok(recommendations);
    }
}