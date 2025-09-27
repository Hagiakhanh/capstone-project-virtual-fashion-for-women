using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.AIChatModel
{
    public class RequestCreateChatWithAI
    {
        public int AIConversationID { get; set; }
        public string Message { get; set; }
    }
}
