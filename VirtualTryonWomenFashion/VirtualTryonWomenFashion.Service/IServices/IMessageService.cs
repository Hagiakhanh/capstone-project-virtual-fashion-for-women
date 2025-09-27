using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IMessageService
    {
        public Task<Message> SendMessageToAIConversation(int conversationChatID, string message);
    }
}
