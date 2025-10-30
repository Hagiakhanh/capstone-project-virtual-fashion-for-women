using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Service.DTO.Notification;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface INotificationService
    {
        Task<int> CountNotificationIsNotRead(int userId);
        Task<MessageModel> CreateNotification(List<CreateNotificationRequest> requestCreateNotifications);
        Task<Pagination<ResponseNotification>> GetAllNotificationByUserId(int userId,
            PaginationParameter paginationParameter);
        Task<ResponseNotification> GetNotificationById(int notificationId);
        Task<bool> MarkAllNotificationsAsRead();
        Task<ResponseNotification?> MarkNotificationAsRead(int notificationId);
    }
}
