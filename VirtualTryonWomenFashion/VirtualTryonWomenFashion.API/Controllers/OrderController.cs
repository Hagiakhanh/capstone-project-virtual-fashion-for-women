using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Collections.Generic;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Service.DTO.GHN;
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
            OrderStatusEnum? orderStatusEnum, bool isDateDecrease, string? textSearch)
        {
            try
            {
                MessageModelWithData<Pagination<ResponseOrderForStaff>> result =
                    await _orderService.GetAllOrderForStaff(page, orderStatusEnum, isDateDecrease, textSearch);
                var metadata = new
                {
                    result.Data.TotalCount,
                    result.Data.PageSize,
                    result.Data.CurrentPage
                };
                Response.Headers.Add("X-Pagination", JsonConvert.SerializeObject(metadata));
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

        [HttpPut("staff/sync-ghn-status/{orderID}")]
        public async Task<IActionResult> UpdateOrderStatusInGHNByCode(int orderID)
        {
            try
            {
                MessageModelWithData<GhnOrderSyncResponse> result = await _orderService.UpdateOrderStatusInGHNByCode(orderID);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("staff/sync-ghn-status")]
        public async Task<IActionResult> UpdateAllOrderStatusInGHN()
        {
            try
            {
                MessageModel result = await _orderService.UpdateAllOrderStatusInGHN();
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("{orderId}/can-refund")]
        public async Task<IActionResult> CanRequestOrderRefund(int orderId)
        {
            try
            {
                MessageModelWithData<bool> result = await _orderService.CanRequestOrderRefund(orderId);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("complete/{orderId}")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> UpdateOrderCompleteForCustomer(int orderId)
        {
            try
            {
                MessageModel result = await _orderService.UpdateOrderCompleteForCustomer(orderId);
                return StatusCode(result.StatusCode, result.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("{orderId}/can-complete")]
        public async Task<IActionResult> CanRequestOrderComplete(int orderId)
        {
            try
            {
                MessageModelWithData<bool> result = await _orderService.CanRequestOrderComplete(orderId);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


    }
}
