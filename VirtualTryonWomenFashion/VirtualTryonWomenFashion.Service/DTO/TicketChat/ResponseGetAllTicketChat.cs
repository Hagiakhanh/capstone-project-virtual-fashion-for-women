using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;

namespace VirtualTryonWomenFashion.Service.DTO.TicketChat
{
    public class ResponseGetAllTicketChat
    {
        public int PendingTicket { get; set; }
        public int OpenTicket { get; set; }
        public Pagination<TicketInformation> TicketInformation { get; set; }
    }

    public class TicketInformation
    {
        public string CustomerName { get; set; }
        public int TicketChatId { get; set; }
        public DateTime CreateAt { get; set; }
        public string Title { get; set; }
        public string Status { get; set; }
        public string? StaffName { get; set; }
    }
}
