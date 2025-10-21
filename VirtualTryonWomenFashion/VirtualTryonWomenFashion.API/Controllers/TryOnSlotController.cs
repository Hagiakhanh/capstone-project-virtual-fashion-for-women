using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Service.DTO.Order;
using VirtualTryonWomenFashion.Service.DTO.TryOnSlotModel;
using VirtualTryonWomenFashion.Service.DTO.UploadImageModel;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Services;

namespace VirtualTryonWomenFashion.API.Controllers;

[ApiController]
[Route("api/try-on-slot")]
public class TryOnSlotController : ControllerBase
{
    private readonly ITryOnSlotService _tryOnSlotService;

    public TryOnSlotController(ITryOnSlotService tryOnSlotService)
    {
        _tryOnSlotService = tryOnSlotService;
    }

    [HttpPost("create-try-on-slot")]
    public async Task<IActionResult> CreateTryOnSlot([FromForm] CreateTryOnRequest createTryOnRequest)
    {
        try
        {
            var tryOnSlot = await _tryOnSlotService.CreateTryOnSlot(createTryOnRequest);
            return Ok(new MessageModelWithData<object>()
            {
                Message = "Tạo try-on slot thành công",
                StatusCode = StatusCodes.Status200OK,
                Data = tryOnSlot
            });
        }
        catch (Exception e)
        {
            return Ok(new MessageModelWithData<object>()
            {
                Message = "Lỗi tạo try-on slot: " + e.Message,
                StatusCode = StatusCodes.Status200OK,
                Data = null
            });
        }

    }

    [HttpPut("update-output-image")]
    public async Task<IActionResult> UpdateOutputImageUrl([FromBody]UpdateTryOnRequest updateTryOnRequest)
    {
        try
        {
            var isSuccess = await _tryOnSlotService.UpdateOutputImageUrl(updateTryOnRequest);
            if (isSuccess)
            {
                return Ok(new MessageModelWithData<object>()
                {
                    Message = "Cập nhật ảnh đầu ra thành công",
                    StatusCode = StatusCodes.Status200OK,
                    Data = null
                });
            }
            else
            {
                return Ok(new MessageModelWithData<object>()
                {
                    Message = "Cập nhật ảnh đầu ra thất bại",
                    StatusCode = StatusCodes.Status200OK,
                    Data = null
                });
            }
        }
        catch (Exception e)
        {
            return Ok(new MessageModelWithData<object>()
            {
                Message = "Lỗi cập nhật ảnh đầu ra: " + e.Message,
                StatusCode = StatusCodes.Status200OK,
                Data = null
            });
        }
    }

    [HttpGet("{tryOnSlotId}")]
    public async Task<IActionResult> GetTryOnSlotByIdAsync([FromRoute] int tryOnSlotId)
    {
        try
        {
            var response = await _tryOnSlotService.GetTryOnSlotByIdAsync(tryOnSlotId);

            if(response == null)
            {
                return BadRequest(new MessageModelWithData<object>()
                {
                    Message = "Lấy lên lượt thử thất bại",
                    StatusCode = StatusCodes.Status400BadRequest,
                    Data = null
                });
            }    
            return Ok(new MessageModelWithData<object>()
            {
                Message = "Lấy lên lượt thử thành công",
                StatusCode = StatusCodes.Status200OK,
                Data = response
            });
        }
        catch (Exception e)
        {
            return Ok(new MessageModelWithData<object>()
            {
                Message = "Lỗi cập nhật ảnh đầu ra: " + e.Message,
                StatusCode = StatusCodes.Status200OK,
                Data = null
            });
        }
    }

    [HttpPost("check-image-model")]
    public async Task<IActionResult> CheckImageModelIsValid([FromForm] ImageModel imageModel)
    {
        try
        {
            var result = await _tryOnSlotService.CheckImageModelIsValid(imageModel);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("history-try-on-slot")]
    public async Task<IActionResult> GetHistoryTryOnSlot([FromQuery] PaginationParameter paginationParameter, [FromQuery] bool isNewest = true)
    {
        try
        {
            Pagination<TryOnResponse> result = await _tryOnSlotService.GetHistoryTryOn(paginationParameter, isNewest);
            var metadata = new
            {
                result.TotalCount,
                result.PageSize,
                result.CurrentPage,
                result.TotalPages,
                result.HasNext,
                result.HasPrevious
            };

            Response.Headers.Add("X-Pagination", JsonConvert.SerializeObject(metadata));
            return Ok(new MessageModelWithData<object>()
            {
                Message = "Lấy danh lịch sử thử đồ thành công",
                StatusCode = StatusCodes.Status200OK,
                Data = result
            });
        }
        catch (Exception ex)
        {
            return Ok(new MessageModelWithData<object>()
            {
                Message = "Lấy danh lịch sử thử đồ thất bại: "+ ex.Message,
                StatusCode = StatusCodes.Status400BadRequest,
                Data = null
            });
        }
    }

    [HttpGet("try-on-slot/{tryOnSlotId}")]
    public async Task<IActionResult> GetHistoryTryOnSlot([FromRoute]int tryOnSlotId )
    {
        try
        {
            TryOnResponse result = await _tryOnSlotService.GetDetailTryOnSlot(tryOnSlotId);

            return Ok(new MessageModelWithData<object>()
            {
                Message = "Lấy chi tiết lịch sử thử đồ thành công",
                StatusCode = StatusCodes.Status200OK,
                Data = result
            });
        }
        catch (Exception ex)
        {
            return Ok(new MessageModelWithData<object>()
            {
                Message = "Lấy chi tiết lịch sử thử đồ thất bại: " + ex.Message,
                StatusCode = StatusCodes.Status400BadRequest,
                Data = null
            });
        }
    }
}