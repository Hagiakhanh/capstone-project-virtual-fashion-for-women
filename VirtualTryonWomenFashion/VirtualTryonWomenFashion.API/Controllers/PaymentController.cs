using Azure;
using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Service.DTO.Momo;
using VirtualTryonWomenFashion.Service.DTO.Order;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.API.Controllers;

[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [HttpPost("momo/momo-callback")]
    public async Task<IActionResult> MomoCallback([FromBody] MomoReturnModel momoReturnModel)
    {
        Console.WriteLine("===== Momo Callback Data =====");
        Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(momoReturnModel));
        await _paymentService.HandleMomoCallback(momoReturnModel);
        return Ok(momoReturnModel);
    }
   
    
    [HttpGet("vnpay/vnpay-callback")]
    public async Task<IActionResult> VnPayCallback()
    {
        if (Request.QueryString.HasValue)
        {
            try
            {
                Console.WriteLine("===== Momo Callback Data =====");
                Console.WriteLine(System.Text.Json.JsonSerializer.Serialize(Request.Query));
                await _paymentService.HandleVnPayCallback(Request.Query);
                return Ok(Request.Query);

            }
            catch (Exception ex)
            {
                return BadRequest(new MessageModelWithData<object>()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "Lỗi khi nhận callBack thông qua IPN từ vnpay: " + ex.Message,
                    Data = null
                });
            }
        }
        return NotFound(new MessageModelWithData<object>()
        {
            StatusCode = StatusCodes.Status404NotFound,
            Message = "Không tìm thấy thông tin thanh toán từ vnpay: " ,
            Data = null
        });
    }
    
    /// <summary>
    /// Tạo payment cho đơn hàng khi khách thanh toán
    /// </summary>
    [HttpPost("create-payment")]
    public async Task<IActionResult> CreatePayment([FromBody] RequestCreateOrder requestCreateOrder)
    {
        try
        {
            string paymentUrl = await _paymentService.CreatePaymentAsync(requestCreateOrder);
            return Ok(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status200OK,
                Message = "Tạo URL thanh toán thành công",
                Data = paymentUrl
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = "Tạo URL thanh toán thất bại: " + ex.Message,
                Data = null
            });
        }
    }
    
    [HttpPost("query-momo-transaction-status/{momoOrderId}") ]
    public async Task<IActionResult> QueryMomoTransactionStatus([FromRoute] int momoOrderId)
    {
        try
        {
            int status = await _paymentService.QueryTransactionStatusInMomoAsync(momoOrderId);
            return Ok(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status200OK,
                Message = "Truy vấn trạng thái giao dịch MoMo thành công",
                Data = status
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = "Truy vấn trạng thái giao dịch MoMo thất bại: " + ex.Message,
                Data = null
            });
        }
    }
    
    [HttpPost("query-vnpay-transaction-status/{orderId}") ]
    public async Task<IActionResult> QueryVnPayTransactionStatus([FromRoute] int orderId)
    {
        try
        {
            string status = await _paymentService.QueryTransactionStatusInVnPayAsync(orderId);
            return Ok(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status200OK,
                Message = "Truy vấn trạng thái giao dịch VnPay thành công",
                Data = status
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = "Truy vấn trạng thái giao dịch VnPay thất bại: " + ex.Message,
                Data = null
            });
        }
    }
    
    [HttpPost("handle-order-and-transaction-status")]
    public async Task<IActionResult> HandleOrderAndTransactionStatus()
    {
        try
        {
            await _paymentService.HandleOrderStatusAndTransactionStatus();
            return Ok(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status200OK,
                Message = "Xử lý trạng thái đơn hàng và giao dịch thành công",
                Data = null
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = "Xử lý trạng thái đơn hàng và giao dịch thất bại: " + ex.Message,
                Data = null
            });
        }
    }
}