using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Category;
using VirtualTryonWomenFashion.Service.DTO.ProductColor;
using VirtualTryonWomenFashion.Service.DTO.Size;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface ICategorySizeTemplateService
    {
        Task<MessageModel> CreateCategoryTemplatesAsync(RequestCreateCategoryTemplatesModel request);
        Task<MessageModel> UpdateCategoryTemplatesAsync(int categoryId, RequestUpdateCategoryTemplatesModel request);
        Task<List<CategorySizeTemplate>> GetAllTemplateByCategoryId(int categoryId);
        Task<List<CategorySizeTemplate>> GetListTemplateSizeByBody(int categoryId, double bust, double waist, double hips, double? shoulder = null);
        Task<List<CategoryTemplateSizeResponse>> GetAllTemplateByCategoryIdNotFullModel(int categoryId);
    }
}
