using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Service.DTO.Cart;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }
    
    [HttpGet]
    public async Task<IActionResult> GetCartItemsAsync()
    {
        try
        {
            var cartItems = await _cartService.GetCartItemsAsync();
            return Ok(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status200OK,
                Message = "Get cart successfully",
                Data = cartItems
            });
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


    [HttpPost("add-item")]
    public async Task<IActionResult> AddItemToCartAsync([FromBody] RequestAddProductToCart requestAddProductToCart)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = " Invalid input data",
                Data = null
            });
        }
        try
        {
            
            bool result = await _cartService.AddProductToCartAsync(requestAddProductToCart);
            if (result)
            {
                return Ok(new MessageModelWithData<object>()
                {
                    StatusCode = StatusCodes.Status201Created,
                    Message =  "Product added to cart successfully." ,
                    Data = null
                });
            }
            return BadRequest(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message =  "Failed to add product to cart." ,
                Data = null
            });
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
    
    [HttpPut("update-quantity")]
    public async Task<IActionResult> UpdateProductQuantityAsync([FromBody] RequestAddProductToCart requestUpdateProductQuantity)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = " Invalid input data",
                Data = null
            });
        }
        try
        {
            ResponseCartItem result = await _cartService.UpdateProductQuantityAsync(requestUpdateProductQuantity);
            if (result !=null)
            {
                return Ok(new MessageModelWithData<object>()
                {
                    StatusCode = StatusCodes.Status200OK,
                    Message =  "Product quantity updated successfully." ,
                    Data = result
                });
            }
            return BadRequest(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message =  "Failed to update product quantity." ,
                Data = null
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
    
    [HttpDelete("remove-item/{cartId}")]
    public async Task<IActionResult> RemoveItemFromCartAsync(int cartId)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = ModelState.Values.First().Errors.First().ErrorMessage,
                Data = null
            });
        }
        try
        {
            bool result = await _cartService.RemoveProductFromCartAsync(cartId);
            if (result)
            {
                return Ok(new MessageModelWithData<object>()
                {
                    StatusCode = StatusCodes.Status200OK,
                    Message =  "Product removed from cart successfully.",
                    Data = null
                });
            }
            return BadRequest(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message =  "Failed to remove product from cart.",
                Data = null
            });
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
    
    // Đang bị lỗi chưa fix được
    [HttpPost("checkout")]
    public async Task<IActionResult> CheckoutAsync([FromBody] RequestCheckout requestCheckout)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status400BadRequest,
                Message = ModelState.Values.First().Errors.First().ErrorMessage,
                Data = null
            });
        }
        try
        {
            var checkoutDetails = await _cartService.CheckoutAsync(requestCheckout);
            return Ok(new MessageModelWithData<object>()
            {
                StatusCode = StatusCodes.Status200OK,
                Message = "Checkout successfully",
                Data = checkoutDetails
            });
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
}