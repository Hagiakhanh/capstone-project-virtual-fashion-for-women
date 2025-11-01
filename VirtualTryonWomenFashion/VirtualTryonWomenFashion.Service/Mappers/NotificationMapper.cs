using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Notification;

namespace VirtualTryonWomenFashion.Service.Mappers;

public static class NotificationMapper
{
  public static Notification MapToNotificationFromRequest(this RequestCreateNotification requestCreateNotification)
  {
    return new Notification()
    {
      ReceiverId = requestCreateNotification.ReceiverId,
      Title = requestCreateNotification.Title,
      Content = requestCreateNotification.Content,
      IsRead = false,
      CreatedAt = DateTime.UtcNow.AddHours(7),
    };
  }

  public static ResponseNotification MapToResponseNotification(this Notification notification)
  {
    return new ResponseNotification()
    {
      NotificationId = notification.NotificationId,
      ReceiverId = notification.ReceiverId,
      CreatedAt = notification.CreatedAt,
      ReadAt = notification.ReadAt,
      IsRead = notification.IsRead,
      Title = notification.Title,
      Content = notification.Content,
    };
  }
}