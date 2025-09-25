namespace VirtualTryonWomenFashion.Service.DTO.OrderDetail;

public class RequestCreateOrderDetail
{
    public int OrderId { get; set; }
    public string ProductVariantId { get; set; }
    public int Quantity { get; set; }
    public decimal PriceAtTime { get; set; }
    public int? CampaignId { get; set; }
}