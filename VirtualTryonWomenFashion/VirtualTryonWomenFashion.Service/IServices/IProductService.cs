using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Product;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IProductService
    {
        Task<MessageModelWithData<Product>> CreateProductAsyncWithValidation(CreateProductRequest request);
        Task<ResponseProductDto> GetProductBySlugAsync(string slug);
        Task<ResponseProductDto> GetProductByIdAsync(string productId);
        Task<ResponseProductDto> GetProductByVariantIdAsync(string variantId);
        Task<ResponsePaginationModel<List<ResponseProductDto>>> GetAllProductsAsync(PaginationParameter pagination);
        Task<MessageModelWithData<Product>> UpdateAsync(string productId, UpdateProductRequest request);
        Task<ResponsePaginationModel<List<ResponseProductDto>>> SearchProductAsync(
            ProductSearchRequest request,
            PaginationParameter pagination);
        Task<MessageModel> DeleteProductAsync(string productId, bool hardDelete = false);
    }
}
