using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.ProductColor;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IProductColorService
    {
        Task<MessageModelWithData<ProductColor>> CreateAsync(string productId, CreateProductColorRequest request);
        Task<ProductColor> GetProductColorByIdAsync(string productColorId);
        Task<MessageModelWithData<ProductColor>> UpdateAsync(string productColorId, UpdateProductColorDto request);
        Task<MessageModel> DeleteAsync(string productColorId);
    }
}
