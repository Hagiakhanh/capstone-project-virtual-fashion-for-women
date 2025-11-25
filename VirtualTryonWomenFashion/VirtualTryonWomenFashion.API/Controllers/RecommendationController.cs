using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Workers;

namespace VirtualTryonWomenFashion.API.Controllers;

[ApiController]
[Route("api/recommendation")]
public class RecommendationController : ControllerBase
{
    private readonly IRecommendationService _recommendationService;
    private readonly RecommendationBackgroundService _backgroundService;
    private readonly ILogger<RecommendationController> _logger;

    public RecommendationController(IRecommendationService recommendationService,
        RecommendationBackgroundService backgroundService,
        ILogger<RecommendationController> logger)
    {
        _recommendationService = recommendationService;
        _backgroundService = backgroundService;
        _logger = logger;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetRecommendations([FromQuery] int topN)
    {
        var recommendations = await _recommendationService
            .GetHybridRecommendationsAsync(topN);
            
        return Ok(recommendations);
    }

    [HttpPost("trigger-compute")]
    public async Task<IActionResult> TriggerComputeAsync()
    {
        try
        {
            _logger.LogInformation("?? API: Manual trigger called");

            // G?i background service
            await _backgroundService.TriggerManualComputeAsync();

            return Ok(new
            {
                success = true,
                message = "Similarity matrix recomputation started successfully."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "? Error when manually triggering compute");

            return StatusCode(500, new
            {
                success = false,
                message = "Internal error while triggering recomputation.",
                error = ex.Message
            });
        }
    }
}