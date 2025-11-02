using Azure;
using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Service.DTO.Momo;
using VirtualTryonWomenFashion.Service.DTO.Order;
using VirtualTryonWomenFashion.Service.DTO.Wallet;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.API.Controllers;

[ApiController]
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
        try
        {
            await _paymentService.HandleMomoCallback(momoReturnModel);
            return Ok(momoReturnModel);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
        
    }
   
    
    [HttpGet("vnpay/vnpay-callback")]
    public async Task<IActionResult> VnPayCallback()
    {
        if (Request.QueryString.HasValue)
        {
            try
            {
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
    
    [HttpPost("create-recharge-payment")]
    public async Task<IActionResult> CreateRechargePayment([FromBody] RequestRechargeWallet requestRechargeWallet)
    {
        try
        {
            string paymentUrl = await _paymentService.CreateLinkPaymentForRehargeAsync(requestRechargeWallet);
            return Ok(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status200OK,
                Message = "Tạo URL nạp tiền thành công",
                Data = paymentUrl
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = "Tạo URL nạp tiền thất bại: " + ex.Message,
                Data = null
            });
        }
    }
    
    [HttpPost("pay-order-by-wallet")]
    public async Task<IActionResult> PayOrderByWalletAsync([FromBody] RequestCreateOrder requestCreateOrder)
    {
        try
        {
            bool result = await _paymentService.PaymentByWalletAsync(requestCreateOrder);
            if (result)
            {
                return Ok(new MessageModelWithData<object>()
                {
                    StatusCode = StatusCodes.Status200OK,
                    Message = "Tạo URL thanh toán thành công",
                    Data = null
                });
            }
            else
            {
                return BadRequest(new MessageModelWithData<object>()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = "Thanh toán bằng ví thất bại",
                    Data = null
                });
            }
            
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
    
    [HttpPost("handle-recharge-transaction-status")]
    public async Task<IActionResult> HandleRechargeTransactionStatus()
    {
        try
        {
            await _paymentService.HandleRechargeTransactionStatus();
            return Ok(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status200OK,
                Message = "Xử lý trạng thái giao dịch nạp tiền thành công",
                Data = null
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = "Xử lý trạng thái giao dịch nạp tiền thất bại: " + ex.Message,
                Data = null
            });
        }
    }
}