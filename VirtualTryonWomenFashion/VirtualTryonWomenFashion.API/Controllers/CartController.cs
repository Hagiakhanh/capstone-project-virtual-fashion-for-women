using Microsoft.AspNetCore.Mvc;
using VirtualTryonWomenFashion.Service.DTO.Cart;
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
            return Ok(cartItems);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
    
    [HttpGet("selected-items")]
    public async Task<IActionResult> GetSelectedCartItemsAsync([FromQuery] List<string> productVariantIds)
    {
        try
        {
            var selectedCartItems = await _cartService.GetSelectedCartItemsAsync(productVariantIds);
            return Ok(selectedCartItems);
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
    
    [HttpPost("add-item")]
    public async Task<IActionResult> AddItemToCartAsync([FromBody] RequestAddProductToCart requestAddProductToCart)
    {
        try
        {
            bool result = await _cartService.AddProductToCartAsync(requestAddProductToCart);
            if (result)
            {
                return Ok(new { Message = "Product added to cart successfully." });
            }
            return BadRequest(new { Message = "Failed to add product to cart." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
    
    [HttpPut("update-quantity")]
    public async Task<IActionResult> UpdateProductQuantityAsync([FromBody] RequestAddProductToCart requestUpdateProductQuantity)
    {
        try
        {
            bool result = await _cartService.UpdateProductQuantityAsync(requestUpdateProductQuantity);
            if (result)
            {
                return Ok(new { Message = "Product quantity updated successfully." });
            }
            return BadRequest(new { Message = "Failed to update product quantity." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
    
    [HttpDelete("remove-item/{productVariantId}")]
    public async Task<IActionResult> RemoveItemFromCartAsync(string productVariantId)
    {
        try
        {
            bool result = await _cartService.RemoveProductFromCartAsync(productVariantId);
            if (result)
            {
                return Ok(new { Message = "Product removed from cart successfully." });
            }
            return BadRequest(new { Message = "Failed to remove product from cart." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { Message = ex.Message });
        }
    }
    
}