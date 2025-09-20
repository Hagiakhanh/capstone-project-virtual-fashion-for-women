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
    public class ProductColorRepository : GenericRepository<ProductColor>, IProductColorRepository
    {
        public ProductColorRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }

        public async Task<ProductColor> GetProductColorByIdAsync(string productColorId)
        {
            return await _context.ProductColors
                .Include(x => x.Product)
                .Include(x => x.Color)
                .Where(p => p.ProductColorId == productColorId)
                .FirstOrDefaultAsync();
        }

        public async Task<ProductColor> GetByIdWithVariantsAsync(string productColorId)
        {
            return await _context.ProductColors
                .Include(pc => pc.ProductVariants)      // load variants
                .Include(pc => pc.ProductImages)        // load images nếu cần
                .FirstOrDefaultAsync(pc => pc.ProductColorId == productColorId);
        }
    }
}
