namespace VirtualTryonWomenFashion.Service.DTO.Cart;

public class RequestAddProductToCart
{
    public string ProductVariantId { get; set; }
    public int Quantity { get; set; }
    public int? TryOnSlotId { get; set; }
}