using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.TicketChat
{
    public class RequestSendMessageTicket
    {
        [Required(ErrorMessage = "Ticket slug is required")]
        public string TicketSlug { get; set; }
        [Required(ErrorMessage = "Content is required")]
        public string Content { get; set; }
    }
}
