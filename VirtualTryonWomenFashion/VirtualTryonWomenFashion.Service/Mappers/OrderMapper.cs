using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Order;
using VirtualTryonWomenFashion.Service.DTO.User;

namespace VirtualTryonWomenFashion.Service.Mappers;

public static class OrderMapper
{
    public static ResponseOrder? MapToResponseOrder(this Order model, UserInformation userInformation)
    {
        if (model == null) return null;

        return new ResponseOrder
        {
            OrderId = model.OrderId,
            ReceiverName = model.ReceiverName,
            ReceiverPhone = model.ReceiverPhone,
            ReceiverAddress = model.ReceiverAddress,
            CreatedAt = model.CreatedAt,
            Status = model.Status,
            Amount = model.Amount,
            Note = model.Note,
            ShippingMoney = model.ShippingMoney,
            ShippingCode = model.ShippingCode,
            EstimatedDelivery = model.EstimatedDelivery,
            UserInformation = userInformation
        };
    }
}