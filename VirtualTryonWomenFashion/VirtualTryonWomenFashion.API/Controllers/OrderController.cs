using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Service.DTO.Order;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.API.Controllers;

[Route("api/[controller]")]
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrderController(IOrderService orderService)
    {
        _orderService = orderService;
    }
    
    [HttpPost("create-order")]
    public async Task<IActionResult> CreateOrder([FromBody] RequestCreateOrder requestCreateOrder)
    {
        try
        {
            var result = await _orderService.CreateOrderAsync(requestCreateOrder);
            return Ok(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status200OK,
                Message = "Create order successfully",
                Data = result
            });
        }catch (Exception e)
        {
            return BadRequest(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = e.Message,
                Data = null
            });
        }
    }
}