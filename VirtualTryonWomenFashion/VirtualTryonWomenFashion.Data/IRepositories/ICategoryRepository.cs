using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;

namespace VirtualTryonWomenFashion.Data.IRepositories
{
    public interface ICategoryRepository : IGenericRepository<Category>
    {
        public Task<List<Category>> GetAllCategories();
        Task<List<string>> GetSlugsAsync(string baseSlug);
        Task<Category> GetCategoryById(int id);
        Task<List<CategorySalesResult>> GetCategorySalesAsync(string timeFilterType);
    }
}
