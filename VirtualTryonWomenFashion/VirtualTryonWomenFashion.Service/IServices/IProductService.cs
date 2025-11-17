using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Product;
using VirtualTryonWomenFashion.Service.DTO.ProductColor;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IProductService
    {
        Task<MessageModelWithData<Product>> CreateProductAsyncWithValidation(CreateProductRequest request);
        //Task<ResponseProductDto> GetProductBySlugAsync(string slug);
        Task<ResponseProductWithListColorAndSizeDto> GetProductBySlugAsync(string slug);
        Task<ResponseProductDto> GetProductByIdAsync(string productId);
        Task<ResponseProductDto> GetProductByVariantIdAsync(string variantId);
        Task<ResponseProductDto> GetProductByProductColorIdAsyncForTryOn(string productColorId);
        // Task<ResponsePaginationModel<List<ResponseProductDto>>> GetAllProductsAsync(PaginationParameter pagination, string? searchTerm,
        //     string? status);
        Task<MessageModelWithData<Pagination<ResponseProductDto>>> GetAllProducts(
            PaginationParameter pagination,
            string? searchTerm,
            string? status,
            ProductSortEnum? sortBy,
            int? categoryId);
        Task<MessageModelWithData<Product>> UpdateAsync(string productId, UpdateProductRequest request);
        Task<MessageModelWithData<Pagination<ResponseProductDto>>> SearchProductAsync(
            ProductSearchRequest request,
            PaginationParameter pagination);
        Task<MessageModel> DeleteProductAsync(string productId, bool hardDelete = false);

        Task<Pagination<ResponseProductDto>> GetProductWithColorRecommentAsync(PaginationParameter pagination, string hexcode, string catergory);
    }
}
