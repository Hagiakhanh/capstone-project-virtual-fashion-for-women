using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface ITransactionService
    {
        public Task<int> CreateTransactionAsync(Transaction transaction);
        public Task<Transaction> GetTransactionByThirdPartyIdAsync(string thirdPartyId);
        public Task<int> UpdateTransactionStatusAsync(IEnumerable<Transaction> transaction);
        public Task<Transaction> GetTransactionByOrderIdAsync(int orderId);
    }
}
