using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.DBContext;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;

namespace VirtualTryonWomenFashion.Data.Repositories
{
    public class CategoryRepository : GenericRepository<Category>, ICategoryRepository
    {
        public CategoryRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }

        public async Task<List<Category>> GetAllCategories()
        {
            return await _context.Categories.ToListAsync();
        }

        public async Task<List<string>> GetSlugsAsync(string baseSlug)
        {
            return await _context.Categories
                .Where(c => c.CategorySlug.StartsWith(baseSlug))
                .Select(c => c.CategorySlug)
                .ToListAsync();
        }

        public async Task<Category> GetCategoryById(int id)
        {
            return await _context.Categories.Include(c => c.Products).Where(c => c.CategoryId == id).FirstOrDefaultAsync();
        }

        public async Task<List<CategorySalesResult>> GetCategorySalesAsync(string timeFilterType)
        {
            var now = DateTime.UtcNow.AddHours(+7);

            var yearFilter = now.Year;
            int? monthFilter = null;
            int? dayFilter = null;

            if (timeFilterType.Equals("Month", StringComparison.OrdinalIgnoreCase))
            {
                monthFilter = now.Month;
            }
            else if (timeFilterType.Equals("Day", StringComparison.OrdinalIgnoreCase))
            {
                monthFilter = now.Month;
                dayFilter = now.Day;
            }

            var query =
                from c in _context.Categories
                from p in c.Products
                from pc in p.ProductColors
                from pv in pc.ProductVariants
                from od in pv.OrderDetails
                where od.Order.Status == OrderStatusEnum.Completed.ToString()
                    && od.Order.CreatedAt.Year == yearFilter
                    && (!monthFilter.HasValue || od.Order.CreatedAt.Month == monthFilter.Value)
                    && (!dayFilter.HasValue || od.Order.CreatedAt.Day == dayFilter.Value)
                group od by new { c.CategoryId, c.CategoryName } into g
                select new CategorySalesResult
                {
                    CategoryId = g.Key.CategoryId,
                    CategoryName = g.Key.CategoryName,
                    TotalSold = g.Sum(x => x.Quantity)
                };

            return await query.ToListAsync();
        }

    }

    public class CategorySalesResult
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; }
        public int TotalSold { get; set; }
    }
}
