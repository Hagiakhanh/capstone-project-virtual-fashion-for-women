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

    }
}
