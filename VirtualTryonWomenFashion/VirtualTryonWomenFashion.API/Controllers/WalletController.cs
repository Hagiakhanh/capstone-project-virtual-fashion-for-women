using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Service.DTO.Wallet;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class WalletController: ControllerBase
{
    private readonly IWalletService _walletService;

    public WalletController(
        IWalletService walletService
        )
    {
        _walletService = walletService;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetWallet()
    {
        try
        {
            ResponseWallet wallet = await _walletService.GetWalletAsync();
            return Ok(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status200OK,
                Message = "Lấy ví người dùng thành công",
                Data = wallet
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = "Lỗi khi lấy ví người dùng: " + ex.Message,
                Data = null
            });
        }
    }
}