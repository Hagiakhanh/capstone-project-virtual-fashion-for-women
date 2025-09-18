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
    public class ProductRepository : GenericRepository<Product>, IProductRepository
    {
        public ProductRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }

        public async Task<List<string>> GetSlugsAsync(string baseSlug)
        {
            return await _context.Products
                .Where(c => c.ProductSlug.StartsWith(baseSlug))
                .Select(c => c.ProductSlug)
                .ToListAsync();
        }

        public async Task<Product> GetProductBySlugAsync(string slug)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.Color)
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.ProductImages)
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.ProductVariants)
                        .ThenInclude(pv => pv.Size)
                .Where(p => p.ProductSlug == slug && p.IsDeleted != true)
                .FirstOrDefaultAsync();
        }
    }
}
