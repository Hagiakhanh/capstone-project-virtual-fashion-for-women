using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.AIChatModel;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class MessageService : IMessageService
    {
        private readonly IMessageRepository _messageRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly IAiconversationRepository _aiConversationRepository;
        private readonly IGeminiService _geminiService;
        public MessageService(IMessageRepository messageRepository, IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService, IAiconversationRepository aiconversationRepository, IGeminiService geminiService)
        {
            _messageRepository = messageRepository;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _aiConversationRepository = aiconversationRepository;
            _geminiService = geminiService;
        }
        public async Task<Message> SendMessageToAIConversation(int conversationChatID, string message)
        {
            try
            {
                int userId = _currentUserService.GetUserId();
                Aiconversation conversationModel = await _aiConversationRepository.GetByIdAsync(userId);
                if (conversationModel == null)
                {
                    throw new Exception("Cuộc trò chuyện AI không hợp lệ");
                }
                List<Message> listHistoryMessage = await _messageRepository.GetAll(new Data.Commons.PaginationParameter { PageIndex = 1, PageSize = 15 },
                    x => x.AiconversationId == conversationChatID,
                    x => x.OrderByDescending(x => x.CreatedAt));

                var currentUserStyle = string.IsNullOrEmpty(conversationModel.CurrentUserStyleJson)
                   ? new SuggestRequirement()
                   : JsonSerializer.Deserialize<SuggestRequirement>(conversationModel.CurrentUserStyleJson);
                string prompt = PromptHelper.BuildConversationalStylistPrompt(listHistoryMessage, currentUserStyle, message);
                string geminiJsonResponse = await _geminiService.CallGeminiAsync(prompt);

                var cleanJson = JsonHelper.CleanJsonString(geminiJsonResponse);
                var analysis = JsonSerializer.Deserialize<OutfitPlanResponse>(cleanJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                var finalOutfit = new OutfitDTO
                {
                    OutfitName = analysis.OutfitName,
                    ResponseText = analysis.ResponseText
                };
                // Check dieu kien goi y ra cac bo do neu co -> them vao bang SuggestedOutfits

                // Save user sent message
                await _messageRepository.InsertAsync(new Data.Models.Message()
                {
                    AiconversationId = conversationChatID,
                    Content = message,
                    SenderId = userId,
                    ReceiverId = null,
                    IsAiresponse = false,
                    CreatedAt = DateTime.UtcNow.AddHours(7),
                });
                // Save chat box sent message
                Message responseMessage = new Data.Models.Message()
                {
                    AiconversationId = conversationChatID,
                    Content = analysis.ResponseText,
                    SenderId = null,
                    ReceiverId = userId,
                    IsAiresponse = true,
                    CreatedAt = DateTime.UtcNow.AddHours(7),
                };
                await _messageRepository.InsertAsync(responseMessage);
                await _unitOfWork.SaveChanges();
                return responseMessage;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
    }
}
