using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.GHN;
using VirtualTryonWomenFashion.Service.DTO.OrderRefund;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Services;

namespace VirtualTryonWomenFashion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderRefundController : ControllerBase
    {
        private readonly IOrderRefundService _orderRefundService;

        public OrderRefundController(IOrderRefundService orderRefundService)
        {
            _orderRefundService = orderRefundService;
        }

        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CreateOrderRefund(RequestCreateOrderRefund requestCreateOrderRefund)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new MessageModel
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "Dữ liệu đầu vào không hợp lệ"
                });
            }
            try
            {
                MessageModel result = await _orderRefundService.CreateOrderRefund(requestCreateOrderRefund);
                return StatusCode(result.StatusCode, result.Message);

            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }

        }

        [HttpGet]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetOrderRefundForCustomer([FromQuery] PaginationParameter page, OrderRefundStatusEnum? refundStatus)
        {
            try
            {
                MessageModelWithData<Pagination<ResponseListOrderRefund>> result = await _orderRefundService.ListOrderRefundForCustomer(page, refundStatus);
                var metadata = new
                {
                    result.Data.TotalCount,
                    result.Data.PageSize,
                    result.Data.CurrentPage,
                    result.Data.TotalPages
                };
                Response.Headers.Add("X-Pagination", JsonConvert.SerializeObject(metadata));
                return StatusCode(result.StatusCode, result);

            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("{orderRefundId}")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> GetOrderRefundDetailForCustomer(int orderRefundId)
        {
            try
            {
                MessageModelWithData<ResponseOrderRefundDetail> result = await _orderRefundService.GetOrderRefundDetailForCustomer(orderRefundId);
                return StatusCode(result.StatusCode, result);

            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("staff")]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> GetOrderRefundForStaff([FromQuery] PaginationParameter page, OrderRefundStatusEnum? refundEnum, string? textSearch)
        {
            try
            {
                MessageModelWithData<Pagination<ResponseOrderRefundStaff>> result = await _orderRefundService.ListOrderRefundForStaff(page, refundEnum, textSearch);
                var metadata = new
                {
                    result.Data.TotalCount,
                    result.Data.PageSize,
                    result.Data.CurrentPage,
                    result.Data.TotalPages
                };
                Response.Headers.Add("X-Pagination", JsonConvert.SerializeObject(metadata));
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("staff/{orderRefundId}")]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> GetOrderRefundDetailForrStaff(int orderRefundId)
        {
            try
            {
                MessageModelWithData<ResponseOrderRefundDetail> result = await _orderRefundService.GetOrderRefundDetailForrStaff(orderRefundId);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("staff")]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> UpdateOrderRefundForStaff(RequestUpdateOrderRefund requestUpdateOrderRefund)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new MessageModel
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "Dữ liệu đầu vào không hợp lệ"
                });
            }

            try
            {
                MessageModelWithData<string> result = await _orderRefundService.UpdateOrderRefundForStaff(requestUpdateOrderRefund);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("staff/sync-ghn-status/{orderRefundId}")]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> UpdateOrderRefundStatusInGHNByCode(int orderRefundId)
        {
            try
            {
                MessageModelWithData<GhnOrderSyncResponse> result = await _orderRefundService.UpdateOrderRefundStatusInGHNByCode(orderRefundId);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("staff/refund-money/{orderRefundId}")]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> RefundMoneyOrderStatus(int orderRefundId)
        {
            try
            {
                MessageModel result = await _orderRefundService.RefundMoneyOrderStatus(orderRefundId);
                return StatusCode(result.StatusCode, result.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("staff/sync-ghn-status")]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> UpdateAllOrderRefundStatusInGHN()
        {
            try
            {
                MessageModel result = await _orderRefundService.UpdateAllOrderRefundStatusInGHN();
                return StatusCode(result.StatusCode, result.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPut("staff/external-delivering/{orderRefundId}")]
        public async Task<IActionResult> UpdateOrderRefundStatusWithExternalDeliveringForStaff(int orderRefundId, OrderRefundStatusEnum orderRefundStatusEnum)
        {
            try
            {
                MessageModel result = await _orderRefundService.UpdateOrderRefundStatusWithExternalDeliveringForStaff(orderRefundId, orderRefundStatusEnum);
                return StatusCode(result.StatusCode, result.Message);
            } catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}
