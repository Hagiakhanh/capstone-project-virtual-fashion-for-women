using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.UserInteraction;
using VirtualTryonWomenFashion.Service.DTO.Wishlist;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class WishlistService : IWishlistService
    {
        private readonly ICurrentUserService _currentUserService;
        private readonly IProductRepository _productRepository;
        private readonly IWishlistRepository _wishlistRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUserInteractionService _userInteractionService;

        public WishlistService(ICurrentUserService currentUserService, IProductRepository productRepository,
            IWishlistRepository wishlistRepository, IUnitOfWork unitOfWork, IUserInteractionService userInteractionService
            )
        {
            _currentUserService = currentUserService;
            _productRepository = productRepository;
            _wishlistRepository = wishlistRepository;
            _unitOfWork = unitOfWork;
            _userInteractionService = userInteractionService;
        }
        public async Task<MessageModel> AddProductToWishlist(RequestAddWishlist requestAddWishlist)
        {
            int userId = _currentUserService.GetUserId();
            Product product = await _productRepository.GetProductByIdAsync(requestAddWishlist.ProductId);
            if (product == null)
            {
                return new MessageModel
                {
                    Message = "Sản phẩm không tồn tại",
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            bool isProductInWishlist = await _wishlistRepository.IsProductInWishlistAsync(userId, requestAddWishlist.ProductId);
            if (isProductInWishlist)
            {
                return new MessageModel
                {
                    Message = "Sản phẩm đã được thêm vào danh sách mong muốn",
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }
            Wishlist newWishlist = new Wishlist
            {
                UserId = userId,
                ProductId = requestAddWishlist.ProductId,
                CreatedAt = DateTime.UtcNow.AddHours(7)
            };
            await _wishlistRepository.InsertAsync(newWishlist);
            int result = await _unitOfWork.SaveChanges();
            if (result > 0)
            {
                await _userInteractionService.CreateAsync(new CreateUpdateUserInteractionDto()
                {
                    ProductId = product.ProductId,
                    InteractionType = UserInteractionEnum.Wishlist.ToString(),
                    Weight = 3m
                });
                return new MessageModel
                {
                    Message = $"Thêm sản phẩm có id {requestAddWishlist.ProductId} vào danh sách mong muốn thành công",
                    StatusCode = StatusCodes.Status200OK
                };
            }
            return new MessageModel
            {
                Message = $"Thêm sản phẩm có id {requestAddWishlist.ProductId} vào danh sách mong muốn thất bại",
                StatusCode = StatusCodes.Status500InternalServerError
            };

        }

        public async Task<MessageModelWithData<List<Wishlist>>> GetAllWishList(PaginationParameter page)
        {
            int userId = _currentUserService.GetUserId();
            List<Wishlist> wishlists = await _wishlistRepository.GetAll(
                pagination: page,
                filter: x => x.UserId == userId
                );
            if (wishlists == null)
            {
                wishlists = new List<Wishlist>();
            }
            if (wishlists.Count > 0)
            {
                return new MessageModelWithData<List<Wishlist>>
                {
                    Message = "Lấy danh sách mong muốn thành công",
                    StatusCode = StatusCodes.Status200OK,
                    Data = wishlists
                };
            }
            return new MessageModelWithData<List<Wishlist>>
            {
                Message = "Danh sách mong muốn rỗng.",
                StatusCode = StatusCodes.Status200OK,
                Data = wishlists
            };
        }

        public async Task<MessageModel> RemoveProductFromWishlist(int wishlistId)
        {
            int userId = _currentUserService.GetUserId();
            Wishlist wishlist = await _wishlistRepository.GetWishlistByUserIdAndWishlistId(userId, wishlistId);
            if (wishlist == null)
            {
                return new MessageModel
                {
                    Message = "Không tìm thấy trong danh sách mong muốn",
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            await _wishlistRepository.Delete(wishlist);
            int result = await _unitOfWork.SaveChanges();
            if (result > 0)
            {
                return new MessageModel
                {
                    Message = $"Xóa khỏi danh sách mong muốn thành công",
                    StatusCode = StatusCodes.Status200OK
                };
            }
            return new MessageModel
            {
                Message = $"Xóa khỏi danh sách mong muốn thất bại",
                StatusCode = StatusCodes.Status500InternalServerError
            };

        }

        public async Task<MessageModel> RemoveProductFromWishlistByProductId(string productId)
        {
            int userId = _currentUserService.GetUserId();
            Product product = await _productRepository.GetProductByIdAsync(productId);
            if (product == null)
            {
                return new MessageModel
                {
                    Message = "Sản phẩm không tồn tại",
                    StatusCode = StatusCodes.Status404NotFound
                };
            }
            bool isProductInWishlist = await _wishlistRepository.IsProductInWishlistAsync(userId, productId);
            if (isProductInWishlist == false)
            {
                return new MessageModel
                {
                    Message = "Không tồn tại sản phẩm trong danh sách mong muốn",
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }
            Wishlist wishlist = await _wishlistRepository.GetWishListByUserIdAndProductId(userId, productId);
            await _wishlistRepository.Delete(wishlist);
            int result = await _unitOfWork.SaveChanges();
            if (result > 0)
            {
                return new MessageModel
                {
                    Message = $"Xóa khỏi danh sách mong muốn thành công",
                    StatusCode = StatusCodes.Status200OK
                };
            }
            return new MessageModel
            {
                Message = $"Xóa khỏi danh sách mong muốn thất bại",
                StatusCode = StatusCodes.Status500InternalServerError
            };

        }
    }
}
