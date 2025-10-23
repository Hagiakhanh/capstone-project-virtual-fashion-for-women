using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.TicketChat
{
    public class RequestCreateTicketChat
    {
        [Required(ErrorMessage = "Require title for ticket chat")]
        public string Title { get; set; }
        public string? Message { get; set; }
    }
}
