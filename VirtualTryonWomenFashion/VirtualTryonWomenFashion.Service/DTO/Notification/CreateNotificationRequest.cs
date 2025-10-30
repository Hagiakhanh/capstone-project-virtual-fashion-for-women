namespace VirtualTryonWomenFashion.Service.DTO.Notification;

public class CreateNotificationRequest
{
    public int ReceiverId { get; set; }

    public string Title { get; set; }

    public string Content { get; set; }
}