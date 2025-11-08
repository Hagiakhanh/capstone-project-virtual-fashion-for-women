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
    public class CategorySizeTemplateRepository : GenericRepository<CategorySizeTemplate>, ICategorySizeTemplateRepository
    {
        public CategorySizeTemplateRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }

        public async Task<List<CategorySizeTemplate>> GetAllTemplateByCategoryId (int categoryId)
        {
            return await _context.CategorySizeTemplates
                .Where(t => t.CategoryId == categoryId)
                .Include(t => t.Size)
                .Include(t => t.Category)
                .ToListAsync();
        }
    }
}
