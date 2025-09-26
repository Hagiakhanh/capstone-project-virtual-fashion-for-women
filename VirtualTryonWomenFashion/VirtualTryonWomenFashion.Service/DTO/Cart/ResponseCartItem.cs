using VirtualTryonWomenFashion.Service.DTO.Product;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;
using VirtualTryonWomenFashion.Service.DTO.User;

namespace VirtualTryonWomenFashion.Service.DTO.Cart;

public class ResponseCartItem
{
    public int CartId { get; set; }

    public int UserId { get; set; }

    public string CreateDate { get; set; }

    public int QuantityItem { get; set; }

    public string ProductVariantId { get; set; }

    public virtual ResponseProductVariantDto ResponseProductVariantDto { get; set; }

    public UserInformation UserInformation { get; set; }
}