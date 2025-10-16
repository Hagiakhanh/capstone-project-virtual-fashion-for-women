using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Wishlist;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Services;

namespace VirtualTryonWomenFashion.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WishlistController : ControllerBase
    {
        private readonly IWishlistService _wishlistService;

        public WishlistController(IWishlistService wishlistService)
        {
            _wishlistService = wishlistService;
        }

        [HttpPost]
        public async Task<IActionResult> AddProductToWishlist(RequestAddWishlist requestAddWishlist)
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
                MessageModel result = await _wishlistService.AddProductToWishlist(requestAddWishlist);
                return StatusCode(result.StatusCode, result.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("{wishlistId}")]
        public async Task<IActionResult> RemoveProductFromWishlist(int wishlistId)
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
                MessageModel result = await _wishlistService.RemoveProductFromWishlist(wishlistId);
                return StatusCode(result.StatusCode, result.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpDelete("product/{productId}")]
        public async Task<IActionResult> RemoveProductFromWishlistByProductId(string productId)
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
                MessageModel result = await _wishlistService.RemoveProductFromWishlistByProductId(productId);
                return StatusCode(result.StatusCode, result.Message);

            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllWishList([FromQuery] PaginationParameter page)
        {
            try
            {
                MessageModelWithData<List<Wishlist>> result = await _wishlistService.GetAllWishList(page);
                return StatusCode(result.StatusCode, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

    }
}
