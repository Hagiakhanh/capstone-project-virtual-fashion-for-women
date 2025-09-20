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
    public class ProductVariantRepository : GenericRepository<ProductVariant>, IProductVariantRepository
    {
        public ProductVariantRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }

        public async Task<ProductVariant> GetVariantWithProductAsync(string variantId)
        {
            return await _context.ProductVariants
                .Include(v => v.ProductColor) // nạp ProductColor
                .FirstOrDefaultAsync(v => v.ProductVariantId == variantId);
        }
    }
}
