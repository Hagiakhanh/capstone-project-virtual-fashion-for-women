using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IAiconversationService
    {
        public Task<List<Aiconversation>> GetAllAIConversation();
        public Task<Aiconversation> GetConversationDetailByID(int id);
        public Task<MessageModelWithData<Aiconversation>> CreateAIConversation(int? userCharacteristicID);
        public Task<MessageModelWithData<Aiconversation>> UpdateAICurrentConversationStyle(int conversationID, string userStyleJsonString);
        public Task<MessageModel> DeleteConversationById(int conversationID);

    }
}
