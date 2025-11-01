using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Notification;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface INotificationService
    {
        Task<int> CreateNotificationAsync(RequestCreateNotification createNotification);
        Task<int> CreateListNotificationAsync(List<RequestCreateNotification> createNotifications);
        Task<int> MarkAsReadAsync(Notification notification);
        Task<int> MarkAllAsReadAsync();
        Task<Pagination<ResponseNotification>> GetNotificationsAsync(PaginationParameter paginationParameter);
        Task<ResponseNotification> GetNotificationByIdAsync(int notificationId);
        Task<int> GetUnreadNotificationCountAsync();
        
    }
}
