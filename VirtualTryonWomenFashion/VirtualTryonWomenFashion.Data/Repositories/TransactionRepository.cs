using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VirtualTryonWomenFashion.Data.DBContext;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;

namespace VirtualTryonWomenFashion.Data.Repositories
{
    public class TransactionRepository : GenericRepository<Transaction>, ITransactionRepository
    {
        public TransactionRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }

        public async Task<Transaction?> GetTransactionByThirdPartyId(string thirdPartyId)
        {
            var transaction = await _context.Transactions
                .Where(x => x.ThirdPartyCode == thirdPartyId)
                .FirstOrDefaultAsync();
            return transaction;
        }

        public async Task<Transaction?> GetTransactionByOrderId(int orderId)
        {
            return await _context.Transactions.Where(x => x.OrderId == orderId && x.Type == TypeTransactionEnum.Purchase.ToString()).FirstOrDefaultAsync();
        }

        public async Task<decimal> GetTotalTransactionAmounts(string transactionType)

        {
            return await _context.Transactions
                .Where(t => t.Type == transactionType && t.Status == "Success")
                .SumAsync(t => t.Money.HasValue ? t.Money.Value : 0);

        }

        public async Task<List<Transaction>> GetTransactionsInRangeAsync(
            DateTime startDate, DateTime endDate)
        {
            return await _context.Transactions
            .Where(t =>
                t.CreatedAt >= startDate &&
                t.CreatedAt <= endDate &&
                t.Status == TransactionStatusEnum.Success.ToString())
            .Include(t => t.Order)
            .ToListAsync();
        }
    }
}
