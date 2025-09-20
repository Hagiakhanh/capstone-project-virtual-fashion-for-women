using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.Cart;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Utils;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class CartService : ICartService
    {
        private readonly ICartRepository _cartRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly IProductVariantService _productVariantService;
        private readonly IProductColorService _productColorService;
        private readonly IShippingService _shippingService;

        public CartService(
            ICartRepository cartRepository, 
            IUnitOfWork unitOfWork, 
            ICurrentUserService currentUserService,
            IProductVariantService productVariantService,
            IShippingService shippingService,
            IProductColorService productColorService)
        {
            _cartRepository = cartRepository;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _productVariantService = productVariantService;
            _shippingService = shippingService;
            _productColorService = productColorService;
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
                orderBy: q=>q.OrderBy(c=>c.CreateDate),
                includes: c=>c.ProductVariant);
            
            //Kiểm tra xem sản phẩm có trong giỏ hàng không
            bool existingItemsNotInCart = productVariantIds.Except(cartItems.Select(c => c.ProductVariantId)).Any();
            if(existingItemsNotInCart)
            {
                throw new Exception("Some products are not in the cart.");
            }
            return cartItems.Where(c => productVariantIds.Contains(c.ProductVariantId)).ToList();
        }

        public async Task<ResponseCheckout> CheckoutAsync(RequestCheckout requestCheckout)
        {
            List<Cart> selectedCartItems = await  this.GetSelectedCartItemsAsync(requestCheckout.productVariantIds);
            if(selectedCartItems.Count == 0)
            {
                throw new Exception("No items selected for checkout.");
            }

            int totalProductPrice = 0;
            
            foreach (var cartItem in selectedCartItems)
            {
                var productColor = await _productColorService.GetProductColorByIdAsync(cartItem.ProductVariant.ProductColorId);

                int productPrice = (int)Math.Ceiling((cartItem.Quantity * productColor.Product.Price) ?? 0);
                totalProductPrice += productPrice;
            }
            int provinceId = await _shippingService.GetProvinceId(requestCheckout.ProvinceName);
            int districtId = await _shippingService.GetDistrictId(requestCheckout.DistrictName, provinceId);
            string wardCode = await _shippingService.GetWardId(requestCheckout.WardName, districtId);
            int totalWeight = (int) Math.Ceiling( selectedCartItems.Sum(c => c.Quantity * c.ProductVariant.ProductWeight) ?? 0);
            int totalHeight = (int) Math.Ceiling( selectedCartItems.Sum(c => c.Quantity * c.ProductVariant.ProductHeight) ?? 0);
            int totalLength =(int) Math.Ceiling(selectedCartItems.Max(c => c.ProductVariant.ProductLength) ?? 0);
            int totalWidth =(int) Math.Ceiling(selectedCartItems.Max(c => c.ProductVariant.ProductWidth) ?? 0);
            ShippingObjectRequest shippingObjectRequest = new ShippingObjectRequest()
            {
                ToWardCode = wardCode,
                ToDistrictId = districtId,
                Weight = totalWeight,
                Length = totalLength,
                Width = totalWidth,
                Height = totalHeight,
                InsuranceValue = totalProductPrice
            };
            (decimal serviceFree, decimal insuranceFree) =
                await _shippingService.CalculateShippingFee(shippingObjectRequest);
            ResponseCheckout responseCheckout = new ResponseCheckout()
            {
                TotalProductPrice = totalProductPrice,
                ServiceFree = serviceFree,
                InsuranceFee = insuranceFree,
                TotalPrice = totalProductPrice + serviceFree + insuranceFree
            };
            return responseCheckout;
        }
    }
}
