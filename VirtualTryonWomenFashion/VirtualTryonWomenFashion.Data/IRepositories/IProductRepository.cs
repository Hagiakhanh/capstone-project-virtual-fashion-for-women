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
        Task<List<Product>> GetAllProductsWithIncludes(PaginationParameter? pagination = null);
        Task<List<string>> GetSlugsAsync(string baseSlug);
        Task<Product> GetProductBySlugAsync(string slug);
        Task<Product> GetProductByIdAsync(string productId);
        Task<Product> GetProductByVariantIdAsync(string variantId);
        Task<List<Product>> SearchProductsWithIncludes(string searchText, string productSort, PaginationParameter pagination);
        Task<int> CountSearchProductsAsync(string productName);
    }
}
