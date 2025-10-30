using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Notification;

namespace VirtualTryonWomenFashion.Service.Mappers;

public static class NotificationMapper
{
    public static Notification toNotificationEntity(this CreateNotificationRequest requestCreateNotification)
    {
        return new Notification()
        {
            ReceiverId = requestCreateNotification.ReceiverId,
            Content = requestCreateNotification.Content,
            IsRead = false,
            Title = requestCreateNotification.Title,
            CreatedAt = DateTime.UtcNow.AddHours(7),
        };
    }

    public static ResponseNotification toNotificationResponse(this Notification notification)
    {
        return new ResponseNotification()
        {
            NotificationId = notification.NotificationId,
            Content = notification.Content,
            IsRead = notification.IsRead,
            Title = notification.Title,
            CreatedAt = notification.CreatedAt,
            ReadAt = notification.ReadAt,
        };
    }
}