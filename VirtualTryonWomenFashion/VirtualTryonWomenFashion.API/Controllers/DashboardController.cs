using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.API.Controllers;

[Route("api/dashboard")]
[ApiController]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }
    
    [HttpGet("overview")]
    public async Task<IActionResult> GetStatistic()
    {
        try
        {
            var result = await _dashboardService.GetBasicSystemIndicators();
            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return StatusCode(400, ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, ex.Message);
        }
    }
}