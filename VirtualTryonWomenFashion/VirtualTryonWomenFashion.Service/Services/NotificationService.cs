using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.Notification;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Mappers;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _notificationRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        public NotificationService(
            INotificationRepository notificationRepository,
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService
            )
        {
            _notificationRepository = notificationRepository;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }
        public async Task<int> CreateNotificationAsync(RequestCreateNotification createNotification)
        {
            Notification newNotification = createNotification.MapToNotificationFromRequest();
            await _notificationRepository.InsertAsync(newNotification);
            return await _unitOfWork.SaveChanges();
        }

        public async Task<int> CreateListNotificationAsync(List<RequestCreateNotification> createNotifications)
        {
            List<Notification> newNotifications = createNotifications.Select(n => n.MapToNotificationFromRequest()).ToList();
            await _notificationRepository.AddRangeAsync(newNotifications);
            return await _unitOfWork.SaveChanges();
        }

        public async Task<int> MarkAsReadAsync(Notification notification)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow.AddHours(7);
            await _notificationRepository.UpdateAsync(notification);
            return await _unitOfWork.SaveChanges();
        }

        public async Task<int> MarkAllAsReadAsync()
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                int userId = _currentUserService.GetUserId();
                List<Notification> notifications = await _notificationRepository.GetAll(
                    filter: n => n.ReceiverId == userId
                );
                foreach (var notification in notifications)
                {
                    notification.IsRead = true;
                    notification.ReadAt = DateTime.UtcNow.AddHours(7);
                }

                await _notificationRepository.UpdateRangeAsync(notifications);
                int result = await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();
                return result;
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new Exception("Lỗi khi đọc toàn bộ thông báo: " + ex.Message);
            }
            
        }

        public async Task<Pagination<ResponseNotification>> GetNotificationsAsync(PaginationParameter paginationParameter)
        {
            int userId = _currentUserService.GetUserId();
            List<Notification> notifications = await _notificationRepository.GetAll(
                pagination: paginationParameter,
                filter: n=> n.ReceiverId == userId,
                orderBy: q => q.OrderByDescending(n => n.CreatedAt)
            );
            int totalRecords = await _notificationRepository.CountAsync(n => n.ReceiverId == userId);
            List<ResponseNotification> responseNotifications = notifications.Select(n => n.MapToResponseNotification()).ToList();
            return new Pagination<ResponseNotification>(responseNotifications, totalRecords,
                paginationParameter.PageIndex, paginationParameter.PageSize);
        }

        public async Task<ResponseNotification> GetNotificationByIdAsync(int notificationId)
        {
            try
            {
                int userId = _currentUserService.GetUserId();
                Notification notification =await _notificationRepository.GetByIdAsync(notificationId);
                if (notification == null)
                {
                    throw new Exception("Không tìm thấy thông báo.");
                }
                if (notification.ReceiverId != userId)
                {
                    throw new Exception("Bạn không có quyền truy cập thông báo này.");
                }

                await this.MarkAsReadAsync(notification);
                return notification.MapToResponseNotification();

            }catch (Exception ex)
            {
                throw new Exception("Lỗi khi lấy thông báo: " + ex.Message);
            }
        }

        public async Task<int> GetUnreadNotificationCountAsync()
        {
            int userId = _currentUserService.GetUserId();
            return await _notificationRepository.CountAsync(n => n.ReceiverId == userId && !(bool)n.IsRead);
        }
    }
}
