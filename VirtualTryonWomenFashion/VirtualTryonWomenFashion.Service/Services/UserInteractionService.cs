using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.DBContext;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.Rating;
using VirtualTryonWomenFashion.Service.DTO.UserInteraction;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class UserInteractionService : IUserInteractionService
    {
        private readonly IUserInteractionRepository _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public UserInteractionService(IUserInteractionRepository repository, IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<MessageModelWithData<UserInteraction>> CreateAsync(CreateUpdateUserInteractionDto request)
        {
            if (request == null || !request.Weight.HasValue || string.IsNullOrEmpty(request.ProductId) || string.IsNullOrEmpty(request.InteractionType))
            {
                return new MessageModelWithData<UserInteraction>
                {
                    Message = "Nhập thông tin chưa đủ",
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            int userId = _currentUserService.GetUserId();

            try
            {
                var newUserInteraction = new UserInteraction
                {
                    UserId = userId,
                    ProductId = request.ProductId,
                    InteractionType = request.InteractionType,
                    CreatedAt = DateTime.UtcNow.AddHours(7),
                    Weight = request.Weight
                };
                await _repository.InsertAsync(newUserInteraction);

                var result = await _unitOfWork.SaveChanges();

                if (result > 0)
                {
                    return new MessageModelWithData<UserInteraction>
                    {
                        Message = "Tạo thành công user interaction",
                        StatusCode = StatusCodes.Status201Created,
                        Data = newUserInteraction
                    };
                }
                else
                {
                    return new MessageModelWithData<UserInteraction>
                    {
                        Message = "Tạo thất bại",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

            }
            catch (Exception ex)
            {
                return new MessageModelWithData<UserInteraction>
                {
                    Message = "Tạo thất bại: Lỗi hệ thống",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        public async Task<MessageModelWithData<UserInteraction>> UpdateAsync(int id, CreateUpdateUserInteractionDto interaction)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null)
            {
                return new MessageModelWithData<UserInteraction>
                {
                    Message = "Không tìm thấy",
                    StatusCode = StatusCodes.Status404NotFound
                };
            }

            try
            {
                existing.InteractionType = interaction.InteractionType ?? existing.InteractionType;
                existing.Weight = interaction.Weight ?? existing.Weight;
                existing.ProductId = interaction.ProductId ?? existing.ProductId;
                existing.CreatedAt = DateTime.UtcNow.AddHours(7);

                await _repository.UpdateAsync(existing);
                var result = await _unitOfWork.SaveChanges();

                if (result > 0)
                {
                    return new MessageModelWithData<UserInteraction>
                    {
                        Message = "Cập nhật thành công",
                        StatusCode = StatusCodes.Status200OK,
                        Data = existing
                    };
                }
                else
                {
                    return new MessageModelWithData<UserInteraction>
                    {
                        Message = "Cập nhật thất bại",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }
            }
            catch
            {
                return new MessageModelWithData<UserInteraction>
                {
                    Message = "Cập nhật thất bại: Lỗi hệ thống",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        public async Task<MessageModel> DeleteAsync(int id)
        {
            var category = await _repository.GetByIdAsync(id);
            if (category == null)
                return new MessageModel
                {
                    Message = "Không tìm thấy",
                    StatusCode = StatusCodes.Status404NotFound
                };

            try
            {
                await _repository.Delete(category);

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

        public async Task<UserInteraction> GetByIdAsync(int id)
        {
            try
            {
                int userId = _currentUserService.GetUserId();
                var data = await _repository.GetFirstOrDefaultAsync(x => x.UserInteractionId == id, x => x.Product, x => x.User);

                if (data == null) throw new ArgumentNullException();

                return data;
            }
            catch (Exception ex) { return null; }
        }

        public async Task<List<UserInteraction>> GetUserInteractionByUserIdAsync()
        {
            try
            {
                int userId = _currentUserService.GetUserId();
                var data = await _repository.GetInteractionByUserIdAsync(userId);

                if (data == null) throw new ArgumentNullException();

                return data;
            }
            catch (Exception ex) { return null; }
        }

        public async Task<List<UserInteraction>> GetUserInteractionByProductIdAsync(string productId)
        {
            try
            {
                var data = await _repository.GetInteractionByProductIdAsync(productId);

                if (data == null) throw new ArgumentNullException();

                return data;
            }
            catch (Exception ex) { return null; }
        }
    }
}
