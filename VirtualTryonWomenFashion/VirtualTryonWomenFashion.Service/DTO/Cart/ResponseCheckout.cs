namespace VirtualTryonWomenFashion.Service.DTO.Cart;

public class ResponseCheckout
{
    public List<ResponseCartItem> Items { get; set; }
    public decimal TotalProductPrice { get; set; }
    public decimal ServiceFree { get; set; } 
    public decimal InsuranceFee { get; set; }
    public decimal TotalPrice { get; set; }
}