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
using VirtualTryonWomenFashion.Service.DTO.Color;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;
using VirtualTryonWomenFashion.Service.DTO.User;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Mappers;
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
        private readonly IProductService _productService;

        public CartService(
            ICartRepository cartRepository,
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService,
            IProductVariantService productVariantService,
            IShippingService shippingService,
            IProductService productService
        )
        {
            _cartRepository = cartRepository;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _productVariantService = productVariantService;
            _shippingService = shippingService;
            _productService = productService;
        }

        public async Task<ResponseCartItem> AddProductToCartAsync(RequestAddProductToCart requestAddProductToCart)
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
                    var responseCartItem = await this.UpdateProductQuantityAsync(
                        new RequestAddProductToCart()
                        {
                            ProductVariantId = requestAddProductToCart.ProductVariantId,
                            Quantity = requestAddProductToCart.Quantity + existingCartItem.Quantity
                        });
                    return responseCartItem;
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
                    
                    return newCartItem.MapToResponseCartItem(new ResponseProductVariantDto());
                }
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new Exception($"Lỗi xảy ra khi thêm 1 sản phẩm vào giỏ hàng: {ex.Message}", ex);
            }
        }

        public async Task<bool> RemoveProductFromCartAsync(int cartId)
        {
            int userId = _currentUserService.GetUserId();

            Cart? existingCartItem = await _cartRepository.GetByIdAsync(cartId);
            if (existingCartItem == null)
            {
                throw new Exception("Sản phẩm trong cart không được tìm thấy.");
            }
            
            if(existingCartItem.UserId != userId)
            {
                throw new Exception("Bạn không có quyền xóa sản phẩm này trong giỏ hàng.");
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

        public async Task<ResponseCartItem> UpdateProductQuantityAsync(RequestAddProductToCart requestAddProductToCart)
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

                var responseProductDto =
                    await _productService.GetProductByVariantIdAsync(existingCartItem.ProductVariantId);
                ResponseProductVariantDto productVariantDto = new ResponseProductVariantDto()
                {
                    ProductVariantId = existingCartItem.ProductVariant.ProductVariantId,
                    SizeId = existingCartItem.ProductVariant.SizeId,
                    VariantName = existingCartItem.ProductVariant.VariantName,
                    CurrentPrice = (decimal)responseProductDto.PriceAtTime,
                    Quantity = existingCartItem.ProductVariant.Quantity,
                    ImageUrl = existingCartItem.ProductVariant.ImageUrl,
                    Status = existingCartItem.ProductVariant.Status,
                    ProductWeight = existingCartItem.ProductVariant.ProductWeight,
                    ProductHeight = existingCartItem.ProductVariant.ProductHeight,
                    ProductLength = existingCartItem.ProductVariant.ProductLength,
                    ProductWidth = existingCartItem.ProductVariant.ProductWidth,
                    SizeDto = responseProductDto.ProductColors
                            .SelectMany(c => c.ProductVariants) // gộp tất cả variant từ các màu
                            .FirstOrDefault(v => v.ProductVariantId == existingCartItem.ProductVariantId).SizeDto ??=
                        new ResponseSizeDto(),
                    ColorDto = responseProductDto.ProductColors
                        .Where(pc => pc.ProductVariants.Any(pv=>pv.ProductVariantId == existingCartItem.ProductVariantId))
                        .Select(pc=>pc.Color).FirstOrDefault()?? new ResponseColorDto()
                };
                return existingCartItem.MapToResponseCartItem(productVariantDto);
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new Exception($"Lỗi xảy ra khi cập nhật số lượng sản phẩm trong giỏ hàng: {ex.Message}.", ex);
            }
        }

        public async Task<List<ResponseCartItem>> GetCartItemsAsync()
        {
            int userId = _currentUserService.GetUserId();
            List<Cart> cartItems = await _cartRepository.GetAll(
                filter: c => c.UserId == userId && !(bool)c.IsDelete,
                orderBy: q => q.OrderBy(c => c.CreateDate),
                includes: c => c.ProductVariant
            );
            List<ResponseCartItem> responseCartItems = new List<ResponseCartItem>();
            foreach (var cartItem in cartItems)
            {
                var responseProductDto =
                    await _productService.GetProductByVariantIdAsync(cartItem.ProductVariantId);
                ResponseProductVariantDto productVariantDto = new ResponseProductVariantDto()
                {
                    ProductVariantId = cartItem.ProductVariant.ProductVariantId,
                    SizeId = cartItem.ProductVariant.SizeId,
                    VariantName = cartItem.ProductVariant.VariantName,
                    CurrentPrice = (decimal)responseProductDto.PriceAtTime,
                    Quantity = cartItem.ProductVariant.Quantity,
                    ImageUrl = cartItem.ProductVariant.ImageUrl,
                    Status = cartItem.ProductVariant.Status,
                    ProductWeight = cartItem.ProductVariant.ProductWeight,
                    ProductHeight = cartItem.ProductVariant.ProductHeight,
                    ProductLength = cartItem.ProductVariant.ProductLength,
                    ProductWidth = cartItem.ProductVariant.ProductWidth,
                    SizeDto = responseProductDto.ProductColors
                            .SelectMany(c => c.ProductVariants) // gộp tất cả variant từ các màu
                            .FirstOrDefault(v => v.ProductVariantId == cartItem.ProductVariantId).SizeDto ??=
                        new ResponseSizeDto(),
                    ColorDto = responseProductDto.ProductColors
                        .Where(pc => pc.ProductVariants.Any(pv=>pv.ProductVariantId == cartItem.ProductVariantId))
                        .Select(pc=>pc.Color).FirstOrDefault()?? new ResponseColorDto()
                };

                responseCartItems.Add(cartItem.MapToResponseCartItem(productVariantDto));
            }

            return responseCartItems ?? new List<ResponseCartItem>();
        }

        public async Task<List<ResponseCartItem>> GetSelectedCartItemsAsync(List<int> cartIds)
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

            List<ResponseCartItem> responseCartItems = new List<ResponseCartItem>();
            foreach (var cartItem in cartItems)
            {
                var responseProductDto =
                    await _productService.GetProductByVariantIdAsync(cartItem.ProductVariantId);
                ResponseProductVariantDto productVariantDto = new ResponseProductVariantDto()
                {
                    ProductVariantId = cartItem.ProductVariant.ProductVariantId,
                    SizeId = cartItem.ProductVariant.SizeId,
                    VariantName = cartItem.ProductVariant.VariantName,
                    CurrentPrice = (decimal)responseProductDto.PriceAtTime,
                    Quantity = cartItem.ProductVariant.Quantity,
                    ImageUrl = cartItem.ProductVariant.ImageUrl,
                    Status = cartItem.ProductVariant.Status,
                    ProductWeight = cartItem.ProductVariant.ProductWeight,
                    ProductHeight = cartItem.ProductVariant.ProductHeight,
                    ProductLength = cartItem.ProductVariant.ProductLength,
                    ProductWidth = cartItem.ProductVariant.ProductWidth,
                    SizeDto = responseProductDto.ProductColors
                            .SelectMany(c => c.ProductVariants) // gộp tất cả variant từ các màu
                            .FirstOrDefault(v => v.ProductVariantId == cartItem.ProductVariantId).SizeDto ??=
                        new ResponseSizeDto(),
                    ColorDto = responseProductDto.ProductColors
                        .Where(pc => pc.ProductVariants.Any(pv=>pv.ProductVariantId == cartItem.ProductVariantId))
                        .Select(pc=>pc.Color).FirstOrDefault()?? new ResponseColorDto()
                };

                responseCartItems.Add(cartItem.MapToResponseCartItem(productVariantDto));
            }

            return responseCartItems;
        }

        public async Task<ResponseCheckout> CheckoutAsync(RequestCheckout requestCheckout)
        {
            List<ResponseCartItem> selectedCartItems = await this.GetSelectedCartItemsAsync(requestCheckout.cartIds);
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
                    (int)Math.Ceiling((cartItem.QuantityItem * responseGetVariantPriceInfo.CurrentPrice) ?? 0);
                totalProductPrice += productPrice;
            }
            (decimal serviceFee, decimal insuranceFree) = (0.0m, 0.0m);

            if(!string.IsNullOrEmpty(requestCheckout.ProvinceName) && !string.IsNullOrEmpty(requestCheckout.DistrictName) && !string.IsNullOrEmpty(requestCheckout.WardName))
            {
                (int provinceId, int districtId, string wardCode) =
                await this.GetAddressCodeAsync(requestCheckout.ProvinceName, requestCheckout.DistrictName,requestCheckout.WardName);
                
                int totalWeight =
                    (int)Math.Ceiling(
                        selectedCartItems.Sum(c => c.QuantityItem * c.ResponseProductVariantDto.ProductWeight) ?? 0);
                int totalHeight =
                    (int)Math.Ceiling(
                        selectedCartItems.Sum(c => c.QuantityItem * c.ResponseProductVariantDto.ProductHeight) ?? 0);
                int totalLength =
                    (int)Math.Ceiling(selectedCartItems.Max(c => c.ResponseProductVariantDto.ProductLength) ?? 0);
                int totalWidth =
                    (int)Math.Ceiling(selectedCartItems.Max(c => c.ResponseProductVariantDto.ProductWidth) ?? 0);
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
                (serviceFee, insuranceFree) =
                    await _shippingService.CalculateShippingFee(shippingObjectRequest);
            }
            ResponseCheckout responseCheckout = new ResponseCheckout()
            {
                Items = selectedCartItems,
                TotalProductPrice = totalProductPrice,
                ServiceFee = serviceFee,
                InsuranceFee = insuranceFree,
                TotalPrice = totalProductPrice + serviceFee + insuranceFree
            };
            return responseCheckout;
        }

        public async Task<(int, int, string)> GetAddressCodeAsync(string provinceName, string districtName,
            string wardName)
        {
            int provinceId = await _shippingService.GetProvinceId(provinceName);
            int districtId = await _shippingService.GetDistrictId(districtName, provinceId);
            string wardCode = await _shippingService.GetWardId(wardName, districtId);
            return (provinceId, districtId, wardCode);
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