using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.AIChatModel
{
    public class RequestCreateChatWithAI
    {
        [Required]
        public int AIConversationID { get; set; }
        [Required]
        [MinLength(1)]
        public string Message { get; set; }
    }
}
