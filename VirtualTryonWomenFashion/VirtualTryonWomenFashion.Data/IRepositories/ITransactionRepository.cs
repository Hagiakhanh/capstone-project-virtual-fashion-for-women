using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.Models;

namespace VirtualTryonWomenFashion.Data.IRepositories
{
    public interface ITransactionRepository : IGenericRepository<Transaction>
    {
        public Task<Transaction?> GetTransactionByThirdPartyId(string thirdPartyId);
        public Task<Transaction?> GetTransactionByOrderId(int orderId);
        Task<decimal> GetTotalTransactionAmounts(string transactionType);
    }
}
