using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.Cart;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly IProductVariantService _productVariantService;

        public CartService(
            ICartRepository cartRepository, 
            IUnitOfWork unitOfWork, 
            ICurrentUserService currentUserService,
            IProductVariantService productVariantService)
        {
            _cartRepository = cartRepository;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _productVariantService = productVariantService;
        }
        public async Task<bool> AddProductToCartAsync(RequestAddProductToCart requestAddProductToCart)
        {
            
            int userId = _currentUserService.GetUserId();

            ProductVariant? existingProductVariant = await _productVariantService.GetProductVariantById(requestAddProductToCart.ProductVariantId);
            
            if(requestAddProductToCart.Quantity <= 0)
            {
                throw new Exception("Quantity must be greater than zero.");
            }
            
            if(existingProductVariant == null)
            {
                throw new Exception("Product not found."); 
            }
            Cart? existingCartItem = await _cartRepository.GetCartItemByUserIdAndProductId(userId, requestAddProductToCart.ProductVariantId);
            
            try
            {
                if (existingCartItem != null)
                {
                    return await this.UpdateProductQuantityAsync(
                        new RequestAddProductToCart()
                        {
                            ProductVariantId = requestAddProductToCart.ProductVariantId,
                            Quantity = requestAddProductToCart.Quantity + existingCartItem.Quantity
                        });
                }
                else
                {
                    await _unitOfWork.BeginTransactionAsync();
                    Cart newCartItem = new Cart
                    {
                        UserId = userId,
                        ProductVariantId = requestAddProductToCart.ProductVariantId,
                        Quantity = requestAddProductToCart.Quantity,
                        CreateDate = DateTime.UtcNow.AddHours(7),
                        IsDelete = false,
                    };

                    await _cartRepository.InsertAsync(newCartItem);
                    await _unitOfWork.SaveChanges();
                    await _unitOfWork.CommitTransactionAsync();
                    return true;
                }
            }catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new Exception($"Error occurred while adding item into the cart: {ex.Message}", ex);
            }
           
        }

        public async Task<bool> RemoveProductFromCartAsync(string productVariantId)
        {
            int userId = _currentUserService.GetUserId();

            Cart? existingCartItem = await _cartRepository.GetCartItemByUserIdAndProductId(userId, productVariantId);

            if (existingCartItem == null)
            {
                throw new Exception("Cart item not found.");
            }

            try
            {
                await _unitOfWork.BeginTransactionAsync();
                await _cartRepository.Delete(existingCartItem);
                await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();
                return true;
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new Exception($"Error occurred while deleting item from the cart: {ex.Message}.", ex);
            }
        }

        public async Task<bool> UpdateProductQuantityAsync(RequestAddProductToCart requestAddProductToCart)
        {
            int userId = _currentUserService.GetUserId();

            Cart? existingCartItem = await _cartRepository.GetCartItemByUserIdAndProductId(userId, requestAddProductToCart.ProductVariantId);

            if (existingCartItem == null)
            {
                throw new Exception("Cart item not found.");
            }
            
            if(requestAddProductToCart.Quantity <= 0)
            {
                throw new Exception("Quantity must be greater than zero.");
            }
            try
            {
                await _unitOfWork.BeginTransactionAsync();
                existingCartItem.Quantity = requestAddProductToCart.Quantity;
                await _cartRepository.UpdateAsync(existingCartItem);
                await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();
                return true;
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new Exception($"Error occurred while updating item in the cart: {ex.Message}.", ex);
            }
        }

        public async Task<List<Cart>> GetCartItemsAsync()
        {
            int userId = _currentUserService.GetUserId();
            List<Cart> cartItems = await _cartRepository.GetAll(
                filter: c=>c.UserId == userId && !(bool)c.IsDelete,
                orderBy: q=>q.OrderBy(c=>c.CreateDate)
                );
            return cartItems?? new List<Cart>();
        }

        public async Task<List<Cart>> GetSelectedCartItemsAsync(List<string> productVariantIds)
        {
            int userId = _currentUserService.GetUserId();
            
            List<Cart> cartItems =  await _cartRepository.GetAll(
                filter: c=>c.UserId == userId && !(bool)c.IsDelete,
                orderBy: q=>q.OrderBy(c=>c.CreateDate)
            );

            //Kiểm tra xem sản phẩm có trong giỏ hàng không
            bool existingItemsNotInCart = productVariantIds.Except(cartItems.Select(c => c.ProductVariantId)).Any();
            if(existingItemsNotInCart)
            {
                throw new Exception("Some products are not in the cart.");
            }
            return cartItems.Where(c => productVariantIds.Contains(c.ProductVariantId)).ToList();
        }
    }
}
