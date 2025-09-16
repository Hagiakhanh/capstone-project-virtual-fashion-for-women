using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Cart;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface ICartService
    {
        Task<bool> AddProductToCartAsync(RequestAddProductToCart requestAddProductToCart);
        Task<bool> RemoveProductFromCartAsync(string productVariantId);
        Task<bool> UpdateProductQuantityAsync(RequestAddProductToCart requestAddProductToCart);
        Task<List<Cart>> GetCartItemsAsync(); 
        Task<List<Cart>> GetSelectedCartItemsAsync(List<string> productVariantIds);
        
    }
}
