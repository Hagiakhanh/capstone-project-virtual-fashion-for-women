using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Wishlist;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IWishlistService
    {
        public Task<MessageModelWithData<List<Wishlist>>> GetAllWishList(PaginationParameter paginationParameter);
        public Task<MessageModel> AddProductToWishlist(RequestAddWishlist requestAddWishlist);
        public Task<MessageModel> RemoveProductFromWishlist(int wishlistId);
        public Task<MessageModel> RemoveProductFromWishlistByProductId(string productId);
    }
}
