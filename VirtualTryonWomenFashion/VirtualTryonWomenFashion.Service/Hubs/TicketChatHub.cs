using Microsoft.AspNetCore.SignalR;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Hubs
{
    public class TicketChatHub : Hub
    {
        private readonly ITicketChatRepository _ticketChatRepository;

        public TicketChatHub(ITicketChatRepository ticketChatRepository)
        {
            _ticketChatRepository = ticketChatRepository;
        }

        public async Task JoinTicketGroup(string ticketSlug)
        {
            int userId = int.Parse(Context.User?.FindFirst("UserID")?.Value);
            TicketChat ticket = await _ticketChatRepository.GetTicketChatBySlug(ticketSlug);
            if (ticket == null)
            {
                throw new HubException("Không tìm thấy ticket.");
            }
            if (ticket.CustomerId != userId && ticket.StaffId != userId)
            {
                throw new HubException("Bạn không có quyền tham gia ticket này.");
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, ticketSlug);
            Console.WriteLine($"{Context.ConnectionId} joined group {ticketSlug}");
        }
    }
}
