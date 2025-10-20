using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.DBContext;
using VirtualTryonWomenFashion.Data.Enum;
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
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Tags)
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.Color)
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.ProductImages)
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.ProductVariants)
                        .ThenInclude(pv => pv.Size)
                .Where(p => p.ProductSlug == slug && p.IsDeleted != true)
                .FirstOrDefaultAsync();

            if (product != null)
            {
                // Sắp xếp ProductVariants theo SizeId
                foreach (var color in product.ProductColors)
                {
                    color.ProductVariants = color.ProductVariants
                        .OrderBy(v => v.Size.MinHeight)
                        .ToList();
                }
            }

            return product;
        }

        public async Task<Product> GetProductByIdAsync(string productId)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Tags)
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.Color)
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.ProductImages)
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.ProductVariants)
                        .ThenInclude(pv => pv.Size)
                .Where(p => p.ProductId == productId && p.IsDeleted != true)
                .FirstOrDefaultAsync();
        }

        public async Task<Product> GetProductByVariantIdAsync(string variantId)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Tags)
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

        public async Task<List<Product>> SearchProductsWithIncludes(string productName, string categoryName, string productSort, PaginationParameter pagination)
        {
            var query = _context.Products
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.ProductVariants).ThenInclude(pv => pv.Size)
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.Color)
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.ProductImages)
                .Include(p => p.Wishlists)
                .Include(p => p.ProductInSaleCampaigns)
                .Include(p => p.Category)
                .Include(p => p.Tags)
                .Where(p => p.IsDeleted != true)
                .AsQueryable();

            // Filter theo ProductName
            if (!string.IsNullOrEmpty(productName))
            {
                query = query.Where(p => p.ProductName.Contains(productName));
            }

            // Filter theo CategoryName
            if (!string.IsNullOrEmpty(categoryName))
            {
                query = query.Where(p => p.Category != null &&
                                         p.Category.CategoryName.Contains(categoryName));
            }

            // Sort
            query = productSort switch
            {
                "AZ" => query.OrderBy(p => p.ProductName),
                "ZA" => query.OrderByDescending(p => p.ProductName),
                "Newest" => query.OrderByDescending(p => p.CreatedAt),
                "PriceAscending" => query.OrderBy(p => p.Price),
                "PriceDescending" => query.OrderByDescending(p => p.Price),
                "BestSelling" => query.OrderByDescending(p =>
                    p.ProductColors.SelectMany(pc => pc.ProductVariants)
                                   .SelectMany(v => v.OrderDetails)
                                   .Sum(od => (int?)od.Quantity) ?? 0),
                _ => query.OrderBy(p => p.ProductName)
            };

            return await query
                .Skip((pagination.PageIndex - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();
        }

        public async Task<int> CountSearchProductsAsync(string productName, string categoryName)
        {
            var query = _context.Products.Where(p => p.IsDeleted != true);

            if (!string.IsNullOrEmpty(productName))
            {
                query = query.Where(p => p.ProductName.Contains(productName));
            }
            if (!string.IsNullOrEmpty(categoryName))
            {
                query = query.Where(p => p.Category != null &&
                                         p.Category.CategoryName.Contains(categoryName));
            }


            return await query.CountAsync();
        }

    }
}
