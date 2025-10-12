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
        Task<ResponseCartItem> AddProductToCartAsync(RequestAddProductToCart requestAddProductToCart);
        Task<bool> RemoveProductFromCartAsync(int cartId);
        Task<int> RemoveMultipleProductsFromCartAsync(List<string> productVariantIds, int userId);
        Task<int> HideCartItemsAsync(List<string> productVariantIds);
        Task<int> ShowCartItemsAsync(List<string> productVariantIds, int userId);
        Task<ResponseCartItem> UpdateProductQuantityAsync(RequestAddProductToCart requestAddProductToCart);
        Task<List<ResponseCartItem>> GetCartItemsAsync(); 
        Task<List<ResponseCartItem>> GetSelectedCartItemsAsync(List<int> cartIds);
        Task<ResponseCheckout> CheckoutAsync(RequestCheckout requestCheckout);
        Task<(int, int, string)> GetAddressCodeAsync(string provinceName, string districtName, string wardName);
        Task RestoreCartItemAsync(int userId, string productVariantId, int quantity);

    }
}
