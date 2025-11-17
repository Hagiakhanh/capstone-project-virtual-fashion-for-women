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
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

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

        public async Task<List<Product>> GetAllProductsWithIncludes()
        {
            return await _context.Products
                .Include(p => p.Tags)
                .Include(p => p.Category)
                .Include(p => p.ProductColors).ThenInclude(pc => pc.Color)
                .Include(p => p.ProductColors).ThenInclude(pc => pc.ProductImages)
                .Include(p => p.ProductColors).ThenInclude(pc => pc.ProductVariants).ThenInclude(pv => pv.Size)
                .Where(p => p.IsDeleted == false).ToListAsync();
        }

        public async Task<List<Product>> GetProductsByIdsWithIncludesAsync(List<string> productIds)
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Tags)
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.Color)
                .Include(p => p.ProductColors)
                    .ThenInclude(p => p.ProductImages)
                .Where(p => productIds.Contains(p.ProductId))
                .Include(p => p.ProductColors).ThenInclude(pc => pc.ProductVariants).ThenInclude(pv => pv.Size)
                .AsNoTracking()
                .ToListAsync();
            return products;
        }

        public async Task<int> CountProductsAsync(string? searchTerm = null, string? status = "all")
        {
            IQueryable<Product> query = _context.Products;

            if (status?.ToLower() == "active")
                query = query.Where(p => p.IsDeleted != true);
            else if (status?.ToLower() == "deleted")
                query = query.Where(p => p.IsDeleted == true);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var lower = searchTerm.ToLower().Trim();
                query = query.Where(p =>
                    p.ProductId.ToString().ToLower().Contains(lower) ||
                    p.ProductName.ToLower().Contains(lower) ||
                    (p.Description != null && p.Description.ToLower().Contains(lower))
                );
            }

            return await query.CountAsync();
        }

        public async Task<Product?> GetProductBySlugAsync(string slug)
        {
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Tags)
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.Color)
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.ProductImages)
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.ProductVariants.Where(pv => pv.Status == "Active"))
                        .ThenInclude(pv => pv.Size)
                            .ThenInclude(s => s.CategorySizeTemplates)
                .Where(p => p.ProductSlug == slug && p.IsDeleted != true)
                .AsNoTracking()
                .FirstOrDefaultAsync();
        }

        public async Task<Product?> GetProductByIdAsync(string productId)
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
                .Where(p => p.ProductId == productId/* && p.IsDeleted != true*/)
                .FirstOrDefaultAsync();
        }

        public async Task<Product?> GetProductByVariantIdAsync(string variantId)
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
                        .ThenInclude(s => s.CategorySizeTemplates)
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

            if (productSort == "InSaleCampaign")
            {
                query = query.Where(p =>
                    p.ProductInSaleCampaigns.Any(c =>
                        c.Campaign.StartDate <= DateOnly.FromDateTime(DateTime.Now) &&
                        c.Campaign.EndDate >= DateOnly.FromDateTime(DateTime.Now) &&
                        c.Campaign.IsDeleted == false &&
                        c.Campaign.Status == "Active"));
            }

            // Sort
            query = productSort switch
            {
                "AZ" => query.OrderBy(p => p.ProductName),
                "ZA" => query.OrderByDescending(p => p.ProductName),
                "Newest" => query.OrderByDescending(p => p.CreatedAt),
                "BestSelling" => query.OrderByDescending(p =>
                    p.ProductColors.SelectMany(pc => pc.ProductVariants)
                                   .SelectMany(v => v.OrderDetails)
                                   .Sum(od => (int?)od.Quantity) ?? 0),
                "InSaleCampaign" => query.OrderByDescending(p =>
                                    p.ProductInSaleCampaigns.Any(c =>
                                    c.Campaign.StartDate <= DateOnly.FromDateTime(DateTime.Now) &&
                                    c.Campaign.EndDate >= DateOnly.FromDateTime(DateTime.Now) &&
                                    c.Campaign.IsDeleted == false &&
                                    c.Campaign.Status == "Active")),
                "PriceAscending" => query.OrderBy(p => p.Price),
                "PriceDescending" => query.OrderByDescending(p => p.Price),
                _ => query.OrderBy(p => p.ProductName)
            };

            return await query
                .Skip((pagination.PageIndex - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();
        }

        public async Task<int> CountSearchProductsAsync(string productName, string categoryName, string productSort)
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
            if (productSort == "InSaleCampaign")
            {
                query = query.Where(p =>
                    p.ProductInSaleCampaigns.Any(c =>
                        c.Campaign.StartDate <= DateOnly.FromDateTime(DateTime.Now) &&
                        c.Campaign.EndDate >= DateOnly.FromDateTime(DateTime.Now) &&
                        c.Campaign.IsDeleted == false &&
                        c.Campaign.Status == "Active"));
            }

            return await query.CountAsync();
        }

        public async Task<Product> GetProductByProductColorIdAsync(string productColorId)
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
               .Where(p => p.ProductColors.Any(pc => pc.ProductColorId == productColorId)
                        && p.IsDeleted != true)
               .FirstOrDefaultAsync();

            if (product != null)
            {
                product.ProductColors = product.ProductColors
                    .Where(pc => pc.ProductColorId == productColorId)
                    .ToList();
            }

            return product;
        }

        public async Task<List<Product>> GetProductWithColorRecommend(List<int> recommendedColors, string categoryName, PaginationParameter pagination)
        {
            var products = await _context.Products
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.ProductVariants).ThenInclude(pv => pv.Size)
                .Include(p => p.ProductColors.Where(pc => pc.ColorId.HasValue && recommendedColors.Contains(pc.ColorId.Value)))
                    .ThenInclude(pc => pc.Color)
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.ProductImages)
                .Include(p => p.Wishlists)
                .Include(p => p.ProductInSaleCampaigns)
                .Include(p => p.Category)
                .Include(p => p.Tags)
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.Color)

                .Where(p => p.ProductColors.Any(pc => recommendedColors.Contains(pc.ColorId.Value)) 
                    && p.IsDeleted!= true && (p.Category.CategoryName.Contains(categoryName)|| string.IsNullOrEmpty(categoryName)))
                .Distinct()
                .Skip((pagination.PageIndex - 1) * pagination.PageSize)
                .Take(pagination.PageSize)
                .ToListAsync();
            return products;
        }

        public async Task<int> CountProductWithColorRecommend(List<int> recommendedColors, string categoryName)
        {
            var products = await _context.Products
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.ProductVariants).ThenInclude(pv => pv.Size)
                .Include(p => p.ProductColors.Where(pc => pc.ColorId.HasValue && recommendedColors.Contains(pc.ColorId.Value)))
                    .ThenInclude(pc => pc.Color)
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.ProductImages)
                .Include(p => p.Wishlists)
                .Include(p => p.ProductInSaleCampaigns)
                .Include(p => p.Category)
                .Include(p => p.Tags)
                .Include(p => p.ProductColors)
                    .ThenInclude(pc => pc.Color)

                .Where(p => p.ProductColors.Any(pc => recommendedColors.Contains(pc.ColorId.Value))
                    && p.IsDeleted != true && (p.Category.CategoryName.Contains(categoryName) || string.IsNullOrEmpty(categoryName)))
                .Distinct()
                .CountAsync();

            return products;
        }
    }
}
