using VirtualTryonWomenFashion.Service.DTO.ProductInSaleCampaign;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;

namespace VirtualTryonWomenFashion.Service.DTO.OrderDetail;

public class ResponseOrderDetail
{
    public int OrderDetailId { get; set; }
    public int Quantity { get; set; }
    public int OrderId { get; set; }
    public decimal PriceAtTime { get; set; }
    public ResponseProductVariantDto ResponseProductVariantDto { get; set; }
    public bool IsReviewed { get; set; }
}