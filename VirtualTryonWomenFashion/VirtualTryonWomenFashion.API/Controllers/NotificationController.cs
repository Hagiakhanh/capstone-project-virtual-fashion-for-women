using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Service.DTO.Notification;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class NotificationController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationController(
        INotificationService notificationService
    )
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllNotificationsAsync([FromQuery] PaginationParameter paginationParameter)
    {
        try
        {
            Pagination<ResponseNotification> result = await _notificationService.GetNotificationsAsync(paginationParameter);
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
                Message = "Lấy danh sách thông báo thành công",
                StatusCode = StatusCodes.Status200OK,
                Data = result
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new MessageModelWithData<object>()
            {
                Message = "Lấy danh sách thông báo thất bại: " + ex.Message,
                StatusCode = StatusCodes.Status400BadRequest,
                Data = null
            });
        }
    }
    
    [HttpGet("{notificationId}")]
    public async Task<IActionResult> GetNotificationByIdAsync([FromRoute] int notificationId)
    {
        try
        {
            var result = await _notificationService.GetNotificationByIdAsync(notificationId);
            return Ok(new MessageModelWithData<object>()
            {
                Message = "Lấy thông báo thành công",
                StatusCode = StatusCodes.Status200OK,
                Data = result
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new MessageModelWithData<object>()
            {
                Message = "Lấy thông báo thất bại: " + ex.Message,
                StatusCode = StatusCodes.Status400BadRequest,
                Data = null
            });
        }
    }
    
    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadNotificationCountAsync()
    {
        try
        {
            var result = await _notificationService.GetUnreadNotificationCountAsync();
            return Ok(new MessageModelWithData<object>()
            {
                Message = "Lấy số lượng thông báo chưa đọc thành công",
                StatusCode = StatusCodes.Status200OK,
                Data = result
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new MessageModelWithData<object>()
            {
                Message = "Lấy số lượng thông báo chưa đọc thất bại: " + ex.Message,
                StatusCode = StatusCodes.Status400BadRequest,
                Data = null
            });
        }
    }
    
    [HttpPut("mark-all-as-read")]
    public async Task<IActionResult> MarkAllAsReadAsync()
    {
        try
        {
            var result = await _notificationService.MarkAllAsReadAsync();
            return Ok(new MessageModelWithData<object>()
            {
                Message = "Đánh dấu tất cả thông báo đã đọc thành công",
                StatusCode = StatusCodes.Status200OK,
                Data = result
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new MessageModelWithData<object>()
            {
                Message = "Đánh dấu tất cả thông báo đã đọc thất bại: " + ex.Message,
                StatusCode = StatusCodes.Status400BadRequest,
                Data = null
            });
        }
    }
}
