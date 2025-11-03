using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using VirtualTryonWomenFashion.Data.DBContext;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;

namespace VirtualTryonWomenFashion.Data.Repositories
{
    public class WalletRepository : GenericRepository<Wallet>, IWalletRepository
    {
        public WalletRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }

        public async Task<Wallet?> GetWalletByUserIdAsync(int userId)
        {
            return await _context.Wallets
                .Include(w => w.User)
                .Where(w => w.User.UserId == userId)
                .FirstOrDefaultAsync();
        }

        public async Task<List<Wallet>> GetAllWalletsByIds(List<int> walletIds)
        {
            var wallets = await _context.Wallets
                .Where(w => walletIds.Contains(w.WalletId))
                .ToListAsync();
            return wallets;
        }
    }
}
