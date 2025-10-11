
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Transaction;

namespace VirtualTryonWomenFashion.Service.Mappers
{
    public static class TransactionMapper
    {
        public static TransactionInformation MapToTransactionInformation(this Transaction transaction)
        {
            return new TransactionInformation()
            {
                TransactionId = transaction.TransactionId,
                OrderId = transaction.OrderId,
                UserId = transaction.UserId,
                CreatedAt = transaction.CreatedAt,
                Method = transaction.Method,
                Money = transaction.Money,
                Status = transaction.Status,
                TransactionCode = transaction.ThirdPartyCode,
                UpdatedAt = transaction.UpdatedAt
            };
        }
    }
}
