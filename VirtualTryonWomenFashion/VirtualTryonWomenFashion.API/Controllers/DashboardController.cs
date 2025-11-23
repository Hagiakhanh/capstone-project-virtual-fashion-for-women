using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Service.DTO.DashBoard;
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

    [HttpGet("revenue")]
    public async Task<IActionResult> GetRevenue([FromQuery] RevenueFilterRequest filter)
    {
        try
        {
            var result = await _dashboardService.GetRevenueAsync(filter);
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

    [HttpGet("category-pie")]
    public async Task<IActionResult> GetCategorySalePie([FromQuery]string timeFilterType)
    {
        try
        {
            var result = await _dashboardService.GetCategorySalesPieAsync(timeFilterType);
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

    [HttpGet("top-try-on-product")]
    public async Task<IActionResult> GetTopTryOnProductsAsync([FromQuery]DateTime? start, [FromQuery] DateTime? end, [FromQuery] int limit)
    {
        try
        {
            var result = await _dashboardService.GetTopTryOnProductsAsync(start, end, limit);
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

    [HttpGet("get-try-on-timeline")]
    public async Task<IActionResult> GetTryOnTimelineAsync([FromQuery]string productId, [FromQuery] DateTime? start, [FromQuery] DateTime? end)
    {
        try
        {
            var result = await _dashboardService.GetTryOnTimelineAsync(productId,start,end);
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