namespace VirtualTryonWomenFashion.Service.DTO.TicketChat;

public class ResponseCustomerTicketChat
{
    public int TicketChatId { get; set; }
    public string TicketChatSlug { get; set; }
    public string Title { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Status { get; set; }
    public string? LastMessage { get; set; }
}