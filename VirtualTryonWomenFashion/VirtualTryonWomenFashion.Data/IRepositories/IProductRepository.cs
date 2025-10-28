using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.Models;

namespace VirtualTryonWomenFashion.Data.IRepositories
{
    public interface IProductRepository : IGenericRepository<Product>
    {
        Task<List<Product>> GetAllProductsWithIncludes();
        Task<Product> GetProductBySlugAsync(string slug);
        Task<Product> GetProductByIdAsync(string productId);
        Task<Product> GetProductByVariantIdAsync(string variantId);
        Task<Product> GetProductByProductColorIdAsync(string productColorId);
        Task<List<Product>> SearchProductsWithIncludes(string productName, string categoryName, string productSort, PaginationParameter pagination);
        Task<int> CountProductsAsync(string? searchTerm = null, string? status = "all");
        Task<int> CountSearchProductsAsync(string productName, string categoryName);
        Task<List<Product>> GetProductWithColorRecommend(List<int> recommendedColors, string categoryName, PaginationParameter pagination);
        Task<int> CountProductWithColorRecommend(List<int> recommendedColors, string categoryName);
    }
}
