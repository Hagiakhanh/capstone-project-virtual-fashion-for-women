using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Rating;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IRatingService
    {
        Task<ResponseRatingDto?> GetRatingByIdAsync(int ratingId);
        Task<ResponseRatingDto?> GetRatingByOrderDetailIdAsync(int orderDetailId);
        //Task<ResponseRatingDto?> GetCustomerRatingInProductAsync(string productId);
        Task<List<ResponseRatingDto>> GetAllProductRatingsAsync(string productId);
        Task<MessageModelWithData<Rating>> CreateRatingAsync(CreateUpdateRatingDto request);
        Task<MessageModelWithData<Rating>> UpdateRatingAsync(int ratingId, CreateUpdateRatingDto dto);
        Task<MessageModel> DeleteRatingAsync(int ratingId);
    }
}
