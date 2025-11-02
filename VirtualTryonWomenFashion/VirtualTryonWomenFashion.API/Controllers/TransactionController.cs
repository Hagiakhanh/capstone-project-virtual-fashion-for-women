using Microsoft.AspNetCore.Mvc;
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
}