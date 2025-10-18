using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Service.DTO.UploadImageModel;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.API.Controllers;

[ApiController]
[Route("api/fit-room")]
public class FitRoomController : ControllerBase
{
    private readonly IFitRoomService _fitRoomService;
    public FitRoomController(IFitRoomService fitRoomService)
    {
        _fitRoomService = fitRoomService;
    }
    

    [HttpGet("get-task-status/{taskId}")]
    public async Task<IActionResult> GetTaskStatus(string taskId)
    {
        try
        {
            var result = await _fitRoomService.GetTaskStatus(taskId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}