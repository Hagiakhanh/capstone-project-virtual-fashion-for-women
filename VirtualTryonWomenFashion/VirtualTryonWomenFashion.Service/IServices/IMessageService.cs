using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.AIChatModel;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IMessageService
    {
        public Task<ResponseAIChatModelWithSuggestion> SendMessageToAIConversation(int conversationChatID, string message);
    }
}
