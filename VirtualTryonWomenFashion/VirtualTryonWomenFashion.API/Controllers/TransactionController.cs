using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using Newtonsoft.Json;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Service.DTO.Order;
using VirtualTryonWomenFashion.Service.DTO.Transaction;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Services;

namespace VirtualTryonWomenFashion.API.Controllers;

[Route("api/[controller]")]
public class TransactionController : ControllerBase
{
    private readonly ITransactionService _transactionService;

    public TransactionController(
        ITransactionService transactionService
    )
    {
        _transactionService = transactionService;
    }

    [HttpGet("get-transaction-history")]
    public async Task<IActionResult> GetTransactionHistory([FromQuery] PaginationParameter page,
        [FromQuery] string transactionStatus = "", [FromQuery] bool isDescesing = true)
    {
        try
        {
            Pagination<TransactionInformation> result =
                await _transactionService.GetTransactionHistory(page, transactionStatus, isDescesing);
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
                Message = "Lấy lịch sử giao dịch thành công",
                StatusCode = 200,
                Data = result
            });
        }
        catch (Exception ex)
        {
            return Ok(new MessageModelWithData<object>()
            {
                Message = "Lấy lịch sử giao dịch thất bại: " + ex.Message,
                StatusCode = 200,
                Data = null
            });
        }
    }

    [HttpGet("get-recharge-transaction-history")]
    public async Task<IActionResult> GetRechargeTransactionHistory([FromQuery] PaginationParameter page)
    {
        try
        {
            Pagination<TransactionInformation> result =
                await _transactionService.GetRechargeTransactionHistory(page);
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
                Message = "Lấy lịch sử nạp tiền thành công",
                StatusCode = 200,
                Data = result
            });
        }
        catch (Exception ex)
        {
            return Ok(new MessageModelWithData<object>()
            {
                Message = "Lấy lịch sử nạp tiền thất bại: " + ex.Message,
                StatusCode = 200,
                Data = null
            });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAllTransaction([FromQuery] int? orderId,
            [FromQuery] string? type,
            [FromQuery] string? status,
            [FromQuery] string? method,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate,
            [FromQuery] PaginationParameter pagination)
    {
        try
        {
            Pagination<ResponseTransactionAdmin> result =
                await _transactionService.GetAllTransactions(orderId, type, status, method, startDate, endDate, pagination);
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
                Message = "Lấy lịch sử giao dịch thành công",
                StatusCode = 200,
                Data = result
            });
        }
        catch (Exception ex)
        {
            return Ok(new MessageModelWithData<object>()
            {
                Message = "Lấy lịch sử giao dịch thất bại: " + ex.Message,
                StatusCode = 200,
                Data = null
            });
        }
    }

    [HttpGet("get-pending-withdraw-transaction")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetPendingWithDrawTransactions(
        [FromQuery] PaginationParameter pagination,
        [FromQuery] string status,
        [FromQuery] bool isDescending = false)
    {
        try
        {
            Pagination<ResponseWithDrawTransactionAdmin> result =
                await _transactionService.GetPendingWithDrawTransactions(isDescending, status, pagination);
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
                Message = "Lấy lịch sử rút tiền trạng thái pending thành công",
                StatusCode = 200,
                Data = result
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new MessageModelWithData<object>()
            {
                Message = "Lấy lịch sử rút tiền trạng thái pending: " + ex.Message,
                StatusCode = 400,
                Data = null
            });
        }
    }

    [HttpPost("{transactionId}/refuse-withdraw-transaction")]
    public async Task<IActionResult> RefuseWithDrawTransactions(
        [FromRoute] int transactionId)
    {
        try
        {
            var result =
                await _transactionService.RefuseWithDrawTransaction(transactionId);

            if (result)
            {
                return Ok(new MessageModelWithData<object>()
                {
                    Message = "Từ chối giao dịch rút tiền thành công.",
                    StatusCode = 200,
                    Data = null
                });
            }else
            {
                return BadRequest(new MessageModelWithData<object>()
                {
                    Message = "Từ chối giao dịch rút tiền thất bại.",
                    StatusCode = 400,
                    Data = null
                });
            }
            
        }
        catch (Exception ex)
        {
            return BadRequest(new MessageModelWithData<object>()
            {
                Message = "Từ chối giao dịch rút tiền thất bại: " + ex.Message,
                StatusCode = 400,
                Data = null
            });
        }
    }

    [HttpPost("{transactionId}/accept-withdraw-transaction")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AcceptWithDrawTransactions(
       [FromRoute] int transactionId)
    {
        try
        {
            var result =
                await _transactionService.AcceptWithDrawTransaction(transactionId);

            if (result)
            {
                return Ok(new MessageModelWithData<object>()
                {
                    Message = "Chấp nhận giao dịch rút tiền thành công.",
                    StatusCode = 200,
                    Data = null
                });
            }
            else
            {
                return BadRequest(new MessageModelWithData<object>()
                {
                    Message = "Chấp nhận giao dịch rút tiền thất bại.",
                    StatusCode = 400,
                    Data = null
                });
            }

        }
        catch (Exception ex)
        {
            return BadRequest(new MessageModelWithData<object>()
            {
                Message = "Chấp nhận giao dịch rút tiền thất bại: " + ex.Message,
                StatusCode = 400,
                Data = null
            });
        }
    }
}