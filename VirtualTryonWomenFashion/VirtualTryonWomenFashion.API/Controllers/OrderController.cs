using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
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
        public async Task<IActionResult> GetAllOrderForStaff([FromQuery] PaginationParameter page,
            OrderStatusEnum? orderStatusEnum, bool isDateDecrease)
        {
            try
            {
                MessageModelWithData<List<ResponseOrderForStaff>> result =
                    await _orderService.GetAllOrderForStaff(page, orderStatusEnum, isDateDecrease);
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
                MessageModelWithData<ResponseOrderDetailForStaff> result =
                    await _orderService.GetOrderDetailForStaff(id);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("staff/{id}")]
        public async Task<IActionResult> UpdateOrderForStaff(int id)
        {
            try
            {
                MessageModelWithData<string> result = await _orderService.UpdateOrderStatusForStaff(id);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("customer/all-orders")]
        public async Task<IActionResult> GetAllOrdersForCustomer([FromQuery] PaginationParameter page, [FromQuery] string orderStatus = "")
        {
            try
            {
                Pagination<ResponseOrder> result = await _orderService.GetAllOrdersForCustomer(page, orderStatus);
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
                    Message = "Lấy danh sách đơn hàng thành công",
                    StatusCode = StatusCodes.Status200OK,
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new MessageModelWithData<object>()
                {
                    Message = "Lấy danh sách đơn hàng thất bại: " + ex.Message,
                    StatusCode = StatusCodes.Status400BadRequest,
                    Data = null
                });
            }

        }

        [HttpGet("customer/{orderId}")]
        public async Task<IActionResult> GetOrderDetailForCustomer([FromRoute] int orderId)
        {
            try
            {
                var result = await _orderService.GetOrderByIdAsync(orderId);
                return Ok(new MessageModelWithData<object>()
                {
                    Message = "Lấy danh sách đơn hàng thành công",
                    StatusCode = StatusCodes.Status200OK,
                    Data = result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new MessageModelWithData<object>()
                {
                    Message = "Lấy danh sách đơn hàng thất bại: " + ex.Message,
                    StatusCode = StatusCodes.Status400BadRequest,
                    Data = null
                });
            }

        }

        [HttpPut("staff/{orderID}/ghn-status")]
        public async Task<IActionResult> UpdateOrderStatusInGHNByCode(int orderID)
        {
            try
            {
                MessageModel result = await _orderService.UpdateOrderStatusInGHNByCode(orderID);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
