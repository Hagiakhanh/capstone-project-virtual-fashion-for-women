using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Category;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface ICategoryService
    {
        public Task<List<Category>> GetAllCategories();
        Task<Category?> GetByIdAsync(int id);
        Task<MessageModelWithData<Category>> CreateCategory(CreateCategoryRequest category);
        Task<MessageModelWithData<Category>> UpdateCategory(int id, CreateCategoryRequest category);
        Task<MessageModel> DeleteCategory(int id);
    }
}
