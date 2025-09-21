using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Service.DTO.Order;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Services;

namespace VirtualTryonWomenFashion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet("staff")]
        public async Task<IActionResult> GetAllOrderForStaff([FromQuery] PaginationParameter page, OrderStatusEnum? orderStatusEnum, bool isDateDecrease)
        {
            try
            {
                MessageModelWithData<List<ResponseOrderForStaff>> result = await _orderService.GetAllOrderForStaff(page, orderStatusEnum, isDateDecrease);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("staff/{id}")]
        public async Task<IActionResult> GetDetailOrderForStaff(int id)
        {
            try
            {
                MessageModelWithData<ResponseOrderDetailForStaff> result = await _orderService.GetOrderDetailForStaff(id);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}
