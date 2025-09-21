using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
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

        public async Task<List<Product>> GetAllProductsWithIncludes(PaginationParameter? pagination = null)
        {
            IQueryable<Product> query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.ProductColors).ThenInclude(pc => pc.Color)
                .Include(p => p.ProductColors).ThenInclude(pc => pc.ProductImages)
                .Include(p => p.ProductColors).ThenInclude(pc => pc.ProductVariants).ThenInclude(pv => pv.Size);

            // lọc product không bị xóa
            query = query.Where(p => p.IsDeleted != true);

            // sắp xếp
            query = query.OrderByDescending(p => p.CreatedAt);

            // phân trang
            if (pagination != null)
            {
                query = query.Skip((pagination.PageIndex - 1) * pagination.PageSize)
                             .Take(pagination.PageSize);
            }

            return await query.ToListAsync();
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

        public async Task<Product> GetProductByVariantIdAsync(string variantId)
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
                .Where(p => p.ProductColors.Any(pc => pc.ProductVariants.Any(pv => pv.ProductVariantId == variantId))
                         && p.IsDeleted != true)
                .FirstOrDefaultAsync();
        }
    }
}
