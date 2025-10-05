using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.DBContext;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;

namespace VirtualTryonWomenFashion.Data.Repositories
{
    public class WishlistRepository : GenericRepository<Wishlist>, IWishlistRepository
    {
        public WishlistRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }

        public async Task<List<string>> GetUserWishlistProductIdsAsync(int userId)
        {
            return await _context.Wishlists
                .Where(w => w.UserId == userId)
                .Select(w => w.ProductId)
                .ToListAsync();
        }

    }
}
