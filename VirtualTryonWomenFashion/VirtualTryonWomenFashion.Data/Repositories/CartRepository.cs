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
    public class CartRepository : GenericRepository<Cart>, ICartRepository
    {
        public CartRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
            
        }

        public async Task<Cart?> GetCartItemByUserIdAndProductId(int userId, string productVariantId)
        {
            return await _context.Carts.FirstOrDefaultAsync(c => c.UserId == userId && c.ProductVariantId == productVariantId);
        }
    }
}
