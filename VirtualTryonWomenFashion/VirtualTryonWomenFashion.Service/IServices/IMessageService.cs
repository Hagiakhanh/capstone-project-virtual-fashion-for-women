using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.AIChatModel;
using VirtualTryonWomenFashion.Service.DTO.TicketChat;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IMessageService
    {
        public Task<ResponseAIChatModelWithSuggestion> SendMessageToAIConversation(int conversationChatID, string message);
        public Task<MessageModel> SendMessageToTicketChat(RequestSendMessageTicket requestSendMessageTicket);
    }
}
