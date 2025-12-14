namespace VirtualTryonWomenFashion.Service.DTO.Cart;

public class ResponseCheckout
{
    public List<ResponseCartItem> Items { get; set; }
    public decimal TotalWeight { get; set; }
    public decimal TotalProductPrice { get; set; }
    public List<ResponseDeliveryTypeFee> DeliveryTypeFees { get; set; }
}