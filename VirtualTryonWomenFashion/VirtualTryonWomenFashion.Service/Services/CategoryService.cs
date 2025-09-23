using Microsoft.AspNetCore.Http;
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
using VirtualTryonWomenFashion.Service.Helpers;
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

        public async Task<MessageModelWithData<Category>> CreateCategory(CreateCategoryRequest category)
        {
            if (category == null || string.IsNullOrEmpty(category.CategoryName))
            {
                //throw new ArgumentNullException("Invalid input");
                return new MessageModelWithData<Category>
                {
                    Message = "Nhập thông tin chưa đủ",
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                Category newCategory = new Category()
                {
                    CategoryName = category.CategoryName,
                    CategorySlug = await GenerateCategorySlug(category.CategoryName),
                    BodyPart = category.BodyPart,
                };
                await _categoryRepository.InsertAsync(newCategory);

                var result = await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();

                if (result > 0)
                {
                    return new MessageModelWithData<Category>
                    {
                        Message = "Tạo thành công category",
                        StatusCode = StatusCodes.Status201Created,
                        Data = newCategory
                    };
                } 
                else
                {
                    return new MessageModelWithData<Category>
                    {
                        Message = "Tạo thất bại",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

            } catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new MessageModelWithData<Category>
                {
                    Message = "Tạo thất bại: Lỗi hệ thống",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        public async Task<MessageModelWithData<Category>> UpdateCategory(int id, CreateCategoryRequest category)
        {
            if (category == null)
                return new MessageModelWithData<Category>
                {
                    Message = "Nhập thông tin chưa đủ",
                    StatusCode = StatusCodes.Status400BadRequest
                };

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                Category existing = await _categoryRepository.GetByIdAsync(id);
                if (existing == null)
                    return new MessageModelWithData<Category>
                    {
                        Message = "Không tìm thấy category",
                        StatusCode = StatusCodes.Status404NotFound
                    };

                existing.CategoryName = category.CategoryName ?? existing.CategoryName;
                existing.CategorySlug = await GenerateCategorySlug(category.CategoryName, existing.CategoryId);
                existing.BodyPart = category.BodyPart ?? existing.BodyPart;

                await _categoryRepository.UpdateAsync(existing);
                var result = await _unitOfWork.SaveChanges();

                await _unitOfWork.CommitTransactionAsync();
                if (result > 0)
                {
                    return new MessageModelWithData<Category>
                    {
                        Message = "Cập nhật thành công category",
                        StatusCode = StatusCodes.Status200OK,
                        Data = existing
                    };
                }
                else
                {
                    return new MessageModelWithData<Category>
                    {
                        Message = "Cập nhật thất bại",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }
            }
            catch
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new MessageModelWithData<Category>
                {
                    Message = "Cập nhật thất bại: Lỗi hệ thống",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        public async Task<MessageModel> DeleteCategory(int categoryId)
        {
            try
            {
                var category = await _categoryRepository.GetByIdAsync(categoryId);
                if (category == null)
                    return new MessageModel
                    {
                        Message = "Không tìm thấy category",
                        StatusCode = StatusCodes.Status404NotFound
                    };

                await _categoryRepository.Delete(category);

                var result = await _unitOfWork.SaveChanges();
                if (result > 0)
                {
                    return new MessageModel
                    {
                        Message = "Xóa thành công category",
                        StatusCode = StatusCodes.Status204NoContent
                    };
                }
                else
                {
                    return new MessageModel
                    {
                        Message = "Xóa thất bại",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }
            } catch
            {
                return new MessageModel
                {
                    Message = "Xóa thất bại: Lỗi hệ thống",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }
    }
}
