namespace VirtualTryonWomenFashion.Service.DTO.TicketChat;

public class ResponseTicketMessage
{
    public string Title { get; set; }
    public int TicketChatId { get; set; }
    public string TicketChatSlug { get; set; }
    public string TicketStatus { get; set; }
    public List<TicketMessageDetail>? Messages { get; set; }
}

public class TicketMessageDetail
{
    public int MessageId { get; set; }
    public int SenderId { get; set; }
    public string Content { get; set; }
    public DateTime CreatedAt { get; set; }
    public string OwnerRole { get; set; }
}