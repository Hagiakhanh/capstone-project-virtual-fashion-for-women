using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Category;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface ICategoryService
    {
        public Task<List<Category>> GetAllCategories();
        Task<Category?> GetByIdAsync(int id);
        Task<int> CreateCategory(CreateCategoryRequest category);
        Task<int> UpdateCategory(int id, CreateCategoryRequest category);
        Task<int> DeleteCategory(int id);
    }
}
