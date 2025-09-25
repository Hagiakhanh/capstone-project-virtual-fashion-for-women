namespace VirtualTryonWomenFashion.Service.DTO.Cart;

public class ResponseCheckout
{
    public decimal TotalProductPrice { get; set; }
    public decimal ServiceFree { get; set; } 
    public decimal InsuranceFee { get; set; }
    public decimal TotalPrice { get; set; }
}