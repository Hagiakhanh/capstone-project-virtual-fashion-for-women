using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.Notification;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Mappers;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public NotificationService(INotificationRepository notificationRepository, 
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService)
        {
            _notificationRepository = notificationRepository;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }
        
        public async Task<int> CountNotificationIsNotRead(int userId)
        {
            var result = await _notificationRepository.GetAll(filter: x=>x.IsRead == false && x.ReceiverId == userId);
	        return result.Count();
        }

        public async Task<MessageModel> CreateNotification(List<CreateNotificationRequest> requestCreateNotifications)
        {
            try
            {
                foreach (var item in requestCreateNotifications)
                {
			        var NotificationEntity = item.toNotificationEntity();
			        await _notificationRepository.InsertAsync(NotificationEntity);
		        }
                await _unitOfWork.SaveChanges();
                return new MessageModel()
                {
                    Message = "Tao notification thanh cong",
                    StatusCode = StatusCodes.Status201Created
                };
            }
            catch (Exception ex)
            {
                return new MessageModel()
                {
                    Message = "Tao notification Thất bại",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        public async Task<Pagination<ResponseNotification>> GetAllNotificationByUserId(int userId, PaginationParameter paginationParameter)
        {
            var listNotification = await _notificationRepository.GetAll(filter: x => x.ReceiverId == userId,
                pagination: paginationParameter, orderBy: x=>x.OrderByDescending(t => t.CreatedAt));
            var listResponseNotification = listNotification.Select(x => x.toNotificationResponse()).ToList();
            var countItem = _notificationRepository.Count(x => x.ReceiverId == userId);
	        return new Pagination<ResponseNotification>(listResponseNotification, countItem, paginationParameter.PageIndex, paginationParameter.PageSize);
        }

        public async Task<ResponseNotification> GetNotificationById(int notificationId)
        {
            var notificationById = await _notificationRepository.GetByIdAsync(notificationId);

	        return (notificationById.toNotificationResponse());
        }

        public async Task<bool> MarkAllNotificationsAsRead()
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
		        var userId = _currentUserService.GetUserId();
                var allNotificationByUserId = await _notificationRepository.GetAll(filter: x=> x.ReceiverId == userId);
                foreach (var item in allNotificationByUserId)
                {
                    item.IsRead = true;
                    item.ReadAt = DateTime.UtcNow.AddHours(7);
                    await _notificationRepository.UpdateAsync(item);
                }
                await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();
                return true;
            }
	        catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return false;
            }
        }

        public async Task<ResponseNotification?> MarkNotificationAsRead(int notificationId)
        {
            var existingNoti = await _notificationRepository.GetByIdAsync(notificationId);
            existingNoti.IsRead = true;
            existingNoti.ReadAt = DateTime.UtcNow.AddHours(7);
            await _notificationRepository.UpdateAsync(existingNoti);
            await _unitOfWork.SaveChanges();

            return existingNoti.toNotificationResponse();
        }
    }
}
