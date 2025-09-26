using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Cart;
using VirtualTryonWomenFashion.Service.DTO.Product;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;

namespace VirtualTryonWomenFashion.Service.Mappers;

public static class CartMapper
{
    public static ResponseCartItem MapToResponseCartItem(this Cart cart,
        ResponseProductVariantDto responseProductVariantDto)
    {
        return new ResponseCartItem()
        {
            CartId = cart.CartId,
            CreateDate = cart.CreateDate.ToString("dd/MM/yyyy"),
            ProductVariantId = cart.ProductVariantId,
            QuantityItem = cart.Quantity,
            UserId = cart.UserId,
            ResponseProductVariantDto = responseProductVariantDto
        };
    }
}