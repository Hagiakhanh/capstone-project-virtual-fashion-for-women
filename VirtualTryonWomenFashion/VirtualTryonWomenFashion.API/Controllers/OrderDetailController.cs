using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.API.Controllers;

[Route("api/[controller]")]
public class OrderDetailController : ControllerBase
{
    private readonly IOrderDetailService _orderDetailService;
    public OrderDetailController(IOrderDetailService orderDetailService)
    {
        _orderDetailService = orderDetailService;
    }
    
    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetOrderDetailsByOrderIdAsync(int orderId)
    {
        try
        {
            var orderDetails = await _orderDetailService.GetOrderDetailsByOrderIdAsync(orderId);
            return Ok(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status200OK,
                Message = "Get order details successfully",
                Data = orderDetails
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = ex.Message,
                Data = null
            });
        }
    }
    
}