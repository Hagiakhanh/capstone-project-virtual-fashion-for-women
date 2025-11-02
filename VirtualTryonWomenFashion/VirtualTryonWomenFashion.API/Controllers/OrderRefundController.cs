using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
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

    }
}
