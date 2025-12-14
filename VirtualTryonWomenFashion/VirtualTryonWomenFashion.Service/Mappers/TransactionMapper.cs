
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
                Type = transaction.Type,
                Status = transaction.Status,
                TransactionCode = transaction.ThirdPartyCode,
                UpdatedAt = transaction.UpdatedAt
            };
        }

        public static ResponseTransactionAdmin MapToResponseTransactionAdmin(this Transaction transaction)
        {
            if (transaction == null)
                return null;

            int? finalOrderId = transaction.OrderId ?? transaction.OrderRefund?.OrderId;

            return new ResponseTransactionAdmin
            {
                TransactionId = transaction.TransactionId,
                UserName = transaction.User?.FullName ?? "Unknown",
                OrderId = finalOrderId,
                Status = transaction.Status,
                Money = transaction.Money,
                Method = transaction.Method,
                Type = transaction.Type,
                CreatedAt = transaction.CreatedAt,
                UpdatedAt= transaction.UpdatedAt,
            };
        }

        public static ResponseWithDrawTransactionAdmin MapToResponseWithDrawTransactionAdmin(this Transaction transaction)
        {
            if (transaction == null)
                return null;
            return new ResponseWithDrawTransactionAdmin
            {
                TransactionId =  transaction.TransactionId,
                UserName = transaction.User?.FullName ?? "Unknown",
                Status = transaction.Status,
                Money = transaction.Money,
                Method = transaction.Method,
                Type = transaction.Type,
                CreatedAt = transaction.CreatedAt,
                BankAccountNumber = transaction.BankAccountNumber,
                BankName = transaction.BankName,
                ThirdPartyCode = transaction.ThirdPartyCode,    
            };
        }

    }
}
