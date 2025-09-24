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
        private readonly IShippingService _shippingService;

        public CartService(
            ICartRepository cartRepository,
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService,
            IProductVariantService productVariantService,
            IShippingService shippingService)
        {
            _cartRepository = cartRepository;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _productVariantService = productVariantService;
            _shippingService = shippingService;
        }

        public async Task<bool> AddProductToCartAsync(RequestAddProductToCart requestAddProductToCart)
        {
            int userId = _currentUserService.GetUserId();

            ProductVariant? existingProductVariant =
                await _productVariantService.GetProductVariantById(requestAddProductToCart.ProductVariantId);

            if (requestAddProductToCart.Quantity <= 0)
            {
                throw new Exception("Số lượng phải lớn hơn 0.");
            }

            if (existingProductVariant == null)
            {
                throw new Exception("Sản phẩm không được tìm thấy.");
            }

            if (requestAddProductToCart.Quantity > existingProductVariant.Quantity)
            {
                throw new Exception("Số lượng sản phẩm trong kho không đủ.");
            }

            Cart? existingCartItem =
                await _cartRepository.GetCartItemByUserIdAndProductId(userId, requestAddProductToCart.ProductVariantId);

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
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new Exception($"Lỗi xảy ra khi thêm 1 sản phẩm vào giỏ hàng: {ex.Message}", ex);
            }
        }

        public async Task<bool> RemoveProductFromCartAsync(string productVariantId)
        {
            int userId = _currentUserService.GetUserId();

            Cart? existingCartItem = (await _cartRepository.GetAll(
                filter: c => c.UserId == userId && c.ProductVariantId == productVariantId
            )).FirstOrDefault();

            if (existingCartItem == null)
            {
                throw new Exception("Sản phẩm trong cart không được tìm thấy.");
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
                throw new Exception($"Lỗi xảy ra khi xóa 1 sản phẩm trong giỏ hàng: {ex.Message}.", ex);
            }
        }

        public async Task<int> RemoveMultipleProductsFromCartAsync(List<string> productVariantIds, int userId)
        {
            List<Cart> listItemsInCart = await _cartRepository.GetAll(
                filter: c => c.UserId == userId && productVariantIds.Contains(c.ProductVariantId)
            );

            if (listItemsInCart == null || !listItemsInCart.Any())
                return 0;

            _cartRepository.DeleteRange(listItemsInCart);
            return await _unitOfWork.SaveChanges();
        }

        public async Task<int> HideCartItemsAsync(List<string> productVariantIds)
        {
            int userId = _currentUserService.GetUserId();
            List<Cart> listItemsInCart = await _cartRepository.GetAll(
                filter: c => c.UserId == userId && productVariantIds.Contains(c.ProductVariantId) && !(bool)c.IsDelete
            );

            if (listItemsInCart == null || !listItemsInCart.Any())
                return 0;
            foreach (var item in listItemsInCart)
            {
                item.IsDelete = true;
            }

            await _cartRepository.UpdateRangeAsync(listItemsInCart);
            return await _unitOfWork.SaveChanges();
        }

        public async Task<int> ShowCartItemsAsync(List<string> productVariantIds, int userId)
        {
            List<Cart> listItemsInCart = await _cartRepository.GetAll(
                filter: c => c.UserId == userId && productVariantIds.Contains(c.ProductVariantId)
            );

            if (listItemsInCart == null || !listItemsInCart.Any())
                return 0;

            foreach (var item in listItemsInCart)
            {
                item.IsDelete = false;
            }

            await _cartRepository.UpdateRangeAsync(listItemsInCart);
            return await _unitOfWork.SaveChanges();
        }

        public async Task<bool> UpdateProductQuantityAsync(RequestAddProductToCart requestAddProductToCart)
        {
            int userId = _currentUserService.GetUserId();

            ProductVariant? existingProductVariant =
                await _productVariantService.GetProductVariantById(requestAddProductToCart.ProductVariantId);
            Cart? existingCartItem =
                await _cartRepository.GetCartItemByUserIdAndProductId(userId, requestAddProductToCart.ProductVariantId);

            if (existingCartItem == null)
            {
                throw new Exception("Sản phẩm trong cart không được tìm thấy.");
            }

            if (requestAddProductToCart.Quantity <= 0)
            {
                throw new Exception("Số lượng phải lớn hơn 0.");
            }

            if (existingProductVariant == null)
            {
                throw new Exception("Sản phẩm không được tìm thấy.");
            }

            if (requestAddProductToCart.Quantity > existingProductVariant.Quantity)
            {
                throw new Exception("Số lượng sản phẩm trong kho không đủ.");
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
                throw new Exception($"Lỗi xảy ra khi cập nhật số lượng sản phẩm trong giỏ hàng: {ex.Message}.", ex);
            }
        }

        public async Task<List<Cart>> GetCartItemsAsync()
        {
            int userId = _currentUserService.GetUserId();
            List<Cart> cartItems = await _cartRepository.GetAll(
                filter: c => c.UserId == userId && !(bool)c.IsDelete,
                orderBy: q => q.OrderBy(c => c.CreateDate)
            );
            return cartItems ?? new List<Cart>();
        }

        public async Task<List<Cart>> GetSelectedCartItemsAsync(List<int> cartIds)
        {
            int userId = _currentUserService.GetUserId();

            List<Cart> cartItems = await _cartRepository.GetAll(
                filter: c => c.UserId == userId && !(bool)c.IsDelete && cartIds.Contains(c.CartId),
                orderBy: q => q.OrderBy(c => c.CreateDate),
                includes: c => c.ProductVariant);

            //Kiểm tra xem sản phẩm có trong giỏ hàng không
            bool existingItemsNotInCart = cartIds.Except(cartItems.Select(c => c.CartId)).Any();
            if (existingItemsNotInCart)
            {
                throw new Exception("Có 1 vài sản phẩm không nằm trong giỏ hàng khi checkout.");
            }

            return cartItems;
        }

        public async Task<ResponseCheckout> CheckoutAsync(RequestCheckout requestCheckout)
        {
            List<Cart> selectedCartItems = await this.GetSelectedCartItemsAsync(requestCheckout.cartIds);
            if (selectedCartItems.Count == 0)
            {
                throw new Exception("No items selected for checkout.");
            }

            int totalProductPrice = 0;

            foreach (var cartItem in selectedCartItems)
            {
                var responseGetVariantPriceInfo =
                    await _productVariantService.GetVariantPriceInfoAsync(cartItem.ProductVariantId);

                int productPrice =
                    (int)Math.Ceiling((cartItem.Quantity * responseGetVariantPriceInfo.CurrentPrice) ?? 0);
                totalProductPrice += productPrice;
            }

            int provinceId = await _shippingService.GetProvinceId(requestCheckout.ProvinceName);
            int districtId = await _shippingService.GetDistrictId(requestCheckout.DistrictName, provinceId);
            string wardCode = await _shippingService.GetWardId(requestCheckout.WardName, districtId);
            int totalWeight =
                (int)Math.Ceiling(selectedCartItems.Sum(c => c.Quantity * c.ProductVariant.ProductWeight) ?? 0);
            int totalHeight =
                (int)Math.Ceiling(selectedCartItems.Sum(c => c.Quantity * c.ProductVariant.ProductHeight) ?? 0);
            int totalLength = (int)Math.Ceiling(selectedCartItems.Max(c => c.ProductVariant.ProductLength) ?? 0);
            int totalWidth = (int)Math.Ceiling(selectedCartItems.Max(c => c.ProductVariant.ProductWidth) ?? 0);
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

        public async Task RestoreCartItemAsync(int userId, string productVariantId, int quantity)
        {
            var deletedItems = await _cartRepository.GetAll
            (filter: c => c.UserId == userId
                          && c.ProductVariantId == productVariantId
                          && (bool)c.IsDelete);

            if (deletedItems != null && deletedItems.Any())
            {
                _cartRepository.DeleteRange(deletedItems);
            }

            var existingItem = await _cartRepository
                .GetCartItemByUserIdAndProductId(userId, productVariantId);

            if (existingItem != null)
            {
                existingItem.Quantity += quantity;
                await _cartRepository.UpdateAsync(existingItem);
            }
            else
            {
                var newItem = new Cart
                {
                    UserId = userId,
                    ProductVariantId = productVariantId,
                    Quantity = quantity,
                    CreateDate = DateTime.UtcNow,
                    IsDelete = false
                };
                await _cartRepository.InsertAsync(newItem);
            }

            await _unitOfWork.SaveChanges();
        }
    }
}