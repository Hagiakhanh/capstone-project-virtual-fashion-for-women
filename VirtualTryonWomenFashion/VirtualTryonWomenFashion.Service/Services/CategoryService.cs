using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.Category;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _categoryRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CategoryService(ICategoryRepository categoryRepository, IUnitOfWork unitOfWork)
        {
            _categoryRepository = categoryRepository;
            _unitOfWork = unitOfWork;
        }

        private async Task<string> GenerateCategorySlug(string name, int? currentId = null)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Category name is required");

            // Bỏ dấu
            string noDiacritics = RemoveDiacritics(name);

            string baseSlug = noDiacritics.Trim().ToLower()
                                          .Replace(" ", "-")
                                          .Replace("--", "-");

            // Lấy toàn bộ slug trong DB có cùng prefix + id để so sánh
            var existing = await _categoryRepository.GetAll(); // query trực tiếp
            var existingSlugs = existing
                .Where(c => currentId == null || c.CategoryId != currentId) // loại chính nó
                .Select(c => c.CategorySlug)
                .ToList();

            // Nếu slug chưa tồn tại hoặc trùng nhưng là chính nó thì giữ nguyên
            if (!existingSlugs.Contains(baseSlug))
            {
                return baseSlug;
            }

            int counter = 1;
            string newSlug;
            do
            {
                newSlug = $"{baseSlug}-{counter}";
                counter++;
            } while (existingSlugs.Contains(newSlug));

            return newSlug;
        }

        private string RemoveDiacritics(string text)
        {
            var normalized = text.Normalize(System.Text.NormalizationForm.FormD);
            var sb = new StringBuilder();

            foreach (var c in normalized)
            {
                var unicodeCategory = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != System.Globalization.UnicodeCategory.NonSpacingMark)
                {
                    sb.Append(c);
                }
            }

            return sb.ToString().Normalize(System.Text.NormalizationForm.FormC);
        }

        public async Task<List<Category>> GetAllCategories()
        {
            var result = await _categoryRepository.GetAllCategories();
            return result;
        }

        public async Task<Category?> GetByIdAsync(int id)
        {
            try
            {
                var category = await _categoryRepository.GetByIdAsync(id);
                if (category == null)
                {
                    throw new ArgumentNullException("Not found");
                }

                return category;
            } catch (Exception ex)
            {
                throw new Exception("Fail");
            }
            
        }

        public async Task<int> CreateCategory(CreateCategoryRequest category)
        {
            if (category == null || string.IsNullOrEmpty(category.CategoryName))
            {
                throw new ArgumentNullException("Invalid input");
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var newCategory = new Category()
                {
                    CategoryName = category.CategoryName,
                    CategorySlug = await GenerateCategorySlug(category.CategoryName),
                    BodyPart = category.BodyPart,
                };
                await _categoryRepository.InsertAsync(newCategory);

                var result = await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();
                return result;

            } catch
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<int> UpdateCategory(int id, CreateCategoryRequest category)
        {
            if (category == null)
                throw new ArgumentNullException("Invalid input");

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var existing = await _categoryRepository.GetByIdAsync(id);
                if (existing == null) throw new ArgumentNullException("Category not found");
                existing.CategoryName = category.CategoryName;
                existing.CategorySlug = await GenerateCategorySlug(category.CategoryName, existing.CategoryId);
                existing.BodyPart = category.BodyPart;

                await _categoryRepository.UpdateAsync(existing);
                var result = await _unitOfWork.SaveChanges();

                await _unitOfWork.CommitTransactionAsync();
                return result;
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        public async Task<int> DeleteCategory(int categoryId)
        {
            var category = await _categoryRepository.GetByIdAsync(categoryId);
            if (category == null)
            {
                throw new ArgumentNullException("Not found");
            }

            await _categoryRepository.Delete(category);

            var result = await _unitOfWork.SaveChanges();
            return result;
        }
    }
}
