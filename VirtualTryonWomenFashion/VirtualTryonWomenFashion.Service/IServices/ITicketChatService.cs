using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Service.DTO.TicketChat;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface ITicketChatService
    {
        public Task<MessageModelWithData<ResponseCreateTicketChat>> CreateTicketChatForCustomer(RequestCreateTicketChat requestCreateTicketChat);
        public Task<MessageModelWithData<ResponseAssignTicketChat>> AssignStaffToTicketChat(RequestAssignTicketChat requestAssignTicketChat);
        public Task<MessageModel> FinishTicketChatForStaff(int ticketChatId);
        public Task<MessageModelWithData<ResponseGetAllTicketChat>> GetTicketChatForStaff(PaginationParameter pagination, TicketChatStatusEnum? ticketChatStatusEnum, bool isDateDecrease);
        public Task<MessageModelWithData<List<ResponseCustomerTicketChat>>> GetOpenTicketAssignForStaff();
        public Task<MessageModelWithData<ResponseTicketMessage>> GetTicketChatMessageBySlug(string ticketChatSlug);
        public Task<MessageModelWithData<Pagination<ResponseCustomerTicketChat>>> GetOpenTicketForCustomer(PaginationParameter page);
    }
}
