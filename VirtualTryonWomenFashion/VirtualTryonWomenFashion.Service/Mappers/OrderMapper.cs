using System.Transactions;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Order;
using VirtualTryonWomenFashion.Service.DTO.OrderDetail;
using VirtualTryonWomenFashion.Service.DTO.User;

namespace VirtualTryonWomenFashion.Service.Mappers;

public static class OrderMapper
{
    public static ResponseOrder? MapToResponseOrder(this Order model, List<ResponseOrderDetail> responseOrderDetails)
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
            InsuranceFee = model.InsuranceFee,
            ShippingCode = model.ShippingCode,
            PaymentUrl = model.PaymentUrl,
            EstimatedDelivery = model.EstimatedDelivery,
            UserInformation = model.Customer.MapToUserInformation(),
            TransactionInformations = model.Transactions.Select(x=>x.MapToTransactionInformation()).ToList(),
            ResponseOrderDetails = responseOrderDetails,
            ResponseStatusLogs = model.StatusLogs.Select(sl => sl.MapToResponseStatusLog()).ToList()
        };
    }
}