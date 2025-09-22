using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.OrderDetail;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;

namespace VirtualTryonWomenFashion.Service.Mappers;

public static class OrderDetailMapper
{
    public static ResponseOrderDetail MapToResponseOrderDetail(this OrderDetail orderDetail,
        ResponseProductVariantDto responseProductVariantDto)
    {
        return new ResponseOrderDetail()
        {
            Quantity = orderDetail.Quantity,
            OrderDetailId = orderDetail.OrderDetailId,
            PriceAtTime = orderDetail.PriceAtTime,
            ResponseProductVariantDto = responseProductVariantDto,
            OrderId = orderDetail.OrderId
        };
    }
}