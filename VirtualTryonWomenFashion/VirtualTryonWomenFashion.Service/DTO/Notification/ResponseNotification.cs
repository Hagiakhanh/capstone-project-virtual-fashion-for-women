namespace VirtualTryonWomenFashion.Service.DTO.Notification;

public class ResponseNotification
{
    public int NotificationId { get; set; }

    public int ReceiverId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? ReadAt { get; set; }

    public bool? IsRead { get; set; }

    public string Title { get; set; }

    public string Content { get; set; }
}