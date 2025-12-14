using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Transaction;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface ITransactionService
    {
        public Task<int> CreateTransactionAsync(Transaction transaction);
        public Task<int> CreateListTransactionAsync(List<Transaction> transactionList);
        public Task<Transaction> GetTransactionByThirdPartyIdAsync(string thirdPartyId);
        public Task<int> UpdateTransactionStatusAsync(IEnumerable<Transaction> transaction);
        public Task<Transaction> GetTransactionByOrderIdAsync(int orderId);
        public Task<Pagination<TransactionInformation>> GetTransactionHistory(PaginationParameter paginationParameter,string transactionStatus, bool isDescending);
        public Task<Pagination<TransactionInformation>> GetRechargeTransactionHistory(PaginationParameter paginationParameter);
        public Task<List<Transaction>> GetAllPendingRechargeTransaction();
        Task<Pagination<ResponseTransactionAdmin>> GetAllTransactions(int? orderId,
            string? type,
            string? status,
            string? method,
            DateTime? startDate,
            DateTime? endDate,
            PaginationParameter pagination);
        Task<Pagination<ResponseWithDrawTransactionAdmin>> GetPendingWithDrawTransactions(bool isDescending, string status, PaginationParameter pagination);
        Task<bool> RefuseWithDrawTransaction(int transactionId);   
        Task<bool> AcceptWithDrawTransaction(int transactionId);
    }
}
