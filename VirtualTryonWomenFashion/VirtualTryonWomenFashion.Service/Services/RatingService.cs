using AutoMapper;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.Rating;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class RatingService : IRatingService
    {
        private readonly IRatingRepository _ratingRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;

        public RatingService(IRatingRepository ratingRepository, IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService,
            IMapper mapper) 
        { 
            _ratingRepository = ratingRepository;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _mapper = mapper;
        }

        public async Task<ResponseRatingDto?> GetRatingByIdAsync(int ratingId)
        {
            try
            {
                var rating = await _ratingRepository.GetRatingByIdAsync(ratingId);

                if (rating == null) throw new ArgumentNullException();

                return _mapper.Map<ResponseRatingDto>(rating);
            }
            catch (Exception ex) 
            {
                return null;
            }
        }

        public async Task<ResponseRatingDto?> GetCustomerRatingInProductAsync(string productId)
        {
            try
            {
                int userId = _currentUserService.GetUserId();
                var rating = await _ratingRepository.GetCustomerRatingInProductAsync(productId, userId);

                if (rating == null) throw new ArgumentNullException();

                return _mapper.Map<ResponseRatingDto>(rating);
            }
            catch (Exception ex) { return null; }
        }

        public async Task<List<ResponseRatingDto>> GetAllProductRatingsAsync(string productId)
        {
            try
            {
                var ratings = await _ratingRepository.GetAllProductRatingsAsync(productId);

                if (ratings == null) throw new ArgumentNullException();

                return _mapper.Map<List<ResponseRatingDto>>(ratings);
            }
            catch (Exception ex) { return null; }
        }

        public async Task<MessageModelWithData<Rating>> CreateRatingAsync(CreateUpdateRatingDto request)
        {
            if (request == null || !request.RatingValue.HasValue || !request.OrderDetailId.HasValue)
            {
                return new MessageModelWithData<Rating>
                {
                    Message = "Nhập thông tin chưa đủ",
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            int userId = _currentUserService.GetUserId();

            try
            {
                var newRating = new Rating
                {
                    RatingValue = request.RatingValue,
                    Comment = request.Comment,
                    CreateAt = DateTime.UtcNow.AddHours(7),
                    UserId = userId,
                    OrderDetailId = (int)request.OrderDetailId
                };
                await _ratingRepository.InsertAsync(newRating);

                var result = await _unitOfWork.SaveChanges();

                if (result > 0)
                {
                    return new MessageModelWithData<Rating>
                    {
                        Message = "Tạo thành công rating",
                        StatusCode = StatusCodes.Status201Created,
                        Data = newRating
                    };
                }
                else
                {
                    return new MessageModelWithData<Rating>
                    {
                        Message = "Tạo thất bại",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new MessageModelWithData<Rating>
                {
                    Message = "Tạo thất bại: Lỗi hệ thống",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        public async Task<MessageModelWithData<Rating>> UpdateRatingAsync(int ratingId, CreateUpdateRatingDto dto)
        {
            if (dto == null)
                return new MessageModelWithData<Rating>
                {
                    Message = "Nhập thông tin chưa đủ",
                    StatusCode = StatusCodes.Status400BadRequest
                };

            try
            {
                var existing = await _ratingRepository.GetRatingByIdAsync(ratingId);
                if (existing == null)
                    return new MessageModelWithData<Rating>
                    {
                        Message = "Không tìm thấy rating",
                        StatusCode = StatusCodes.Status404NotFound
                    };

                existing.RatingValue = dto.RatingValue ?? existing.RatingValue;
                existing.Comment = dto.Comment ?? existing.Comment;

                await _ratingRepository.UpdateAsync(existing);
                var result = await _unitOfWork.SaveChanges();

                if (result > 0)
                {
                    return new MessageModelWithData<Rating>
                    {
                        Message = "Cập nhật thành công rating",
                        StatusCode = StatusCodes.Status200OK,
                        Data = existing
                    };
                }
                else
                {
                    return new MessageModelWithData<Rating>
                    {
                        Message = "Cập nhật thất bại",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }
            }
            catch
            {
                return new MessageModelWithData<Rating>
                {
                    Message = "Cập nhật thất bại: Lỗi hệ thống",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }

        }

        public async Task<MessageModel> DeleteRatingAsync(int ratingId)
        {
            try
            {
                var category = await _ratingRepository.GetByIdAsync(ratingId);
                if (category == null)
                    return new MessageModel
                    {
                        Message = "Không tìm thấy rating",
                        StatusCode = StatusCodes.Status404NotFound
                    };

                await _ratingRepository.Delete(category);

                var result = await _unitOfWork.SaveChanges();
                if (result > 0)
                {
                    return new MessageModel
                    {
                        Message = "Xóa thành công category",
                        StatusCode = StatusCodes.Status204NoContent
                    };
                }
                else
                {
                    return new MessageModel
                    {
                        Message = "Xóa thất bại",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }
            }
            catch
            {
                return new MessageModel
                {
                    Message = "Xóa thất bại: Lỗi hệ thống",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }
    }
}
