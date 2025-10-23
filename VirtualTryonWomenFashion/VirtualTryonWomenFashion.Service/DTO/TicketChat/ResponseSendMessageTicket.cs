using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.TicketChat
{
    public class ResponseSendMessageTicket
    {
        public int SenderId { get; set; }
        public string Content { get; set; }
        public DateTime CreateAt { get; set; }
    }
}
