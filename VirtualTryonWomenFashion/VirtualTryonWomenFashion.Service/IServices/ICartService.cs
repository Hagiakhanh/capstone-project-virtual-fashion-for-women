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
        Task<int> RemoveMultipleProductsFromCartAsync(List<string> productVariantIds, int userId);
        Task<int> HideCartItemsAsync(List<string> productVariantIds);
        Task<int> ShowCartItemsAsync(List<string> productVariantIds, int userId);
        Task<bool> UpdateProductQuantityAsync(RequestAddProductToCart requestAddProductToCart);
        Task<List<Cart>> GetCartItemsAsync(); 
        Task<List<Cart>> GetSelectedCartItemsAsync(List<int> cartIds);
        Task<ResponseCheckout> CheckoutAsync(RequestCheckout requestCheckout);
        Task RestoreCartItemAsync(int userId, string productVariantId, int quantity);

    }
}
