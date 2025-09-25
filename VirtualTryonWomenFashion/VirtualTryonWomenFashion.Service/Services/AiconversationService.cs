using Microsoft.AspNetCore.Http;
using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.AIChatModel;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class AiconversationService : IAiconversationService
    {
        private readonly IAiconversationRepository _aiconversationRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly ICharacteristicService _characteristicService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IGeminiService _geminiService;
        public AiconversationService(IAiconversationRepository aiconversationRepository, ICurrentUserService currentUserService,
            ICharacteristicService characteristicService, IUnitOfWork unitOfWork, IGeminiService geminiService)
        {
            _aiconversationRepository = aiconversationRepository;
            _currentUserService = currentUserService;
            _characteristicService = characteristicService;
            _unitOfWork = unitOfWork;
            _geminiService = geminiService;
        }
        public async Task<MessageModelWithData<Aiconversation>> CreateAIConversation(int? userCharacteristicID)
        {
            try
            {
                int currentUserId = _currentUserService.GetUserId();
                Aiconversation aiConversation = new() { UserId = currentUserId };

                if (userCharacteristicID.HasValue)
                {
                    MessageModelWithData<Characteristic> selectedCharacteristic = await _characteristicService.GetDetailCharacteristicByID(currentUserId);

                    if (selectedCharacteristic == null)
                    {
                        throw new ArgumentException(selectedCharacteristic.Message);
                    }
                    string characteristicDescribe = _characteristicService.GetCharacteristicDescription(selectedCharacteristic.Data);
                    Message messageDescribe = new Message { Content = characteristicDescribe, SenderId = currentUserId, ReceiverId = null, CreatedAt = DateTime.UtcNow.AddHours(7) };
                    aiConversation.Messages.Add(messageDescribe);
                    string prompt = PromptHelper.BuildConversationalStylistPrompt(null, null, characteristicDescribe);
                    string geminiJsonResponse = await _geminiService.CallGeminiAsync(prompt);
                    var cleanJson = JsonHelper.CleanJsonString(geminiJsonResponse);

                    var analysis = JsonSerializer.Deserialize<OutfitPlanResponse>(cleanJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    var options = new JsonSerializerOptions
                    {
                        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
                        WriteIndented = true
                    };

                    aiConversation.CurrentUserStyleJson = JsonSerializer.Serialize(analysis.UpdatedStyle, options);
                    aiConversation.Messages.Add(new Message() { Content = analysis.ResponseText, SenderId = null, ReceiverId = currentUserId, IsAiresponse = true });

                }
                await _aiconversationRepository.InsertAsync(aiConversation);
                await _unitOfWork.SaveChanges();
                return new MessageModelWithData<Aiconversation>() { Data = aiConversation, Message = "Tạo thành công cuộc trò chuyện", StatusCode = StatusCodes.Status200OK };

            }
            catch (ArgumentException ex)
            {
                return new MessageModelWithData<Aiconversation>()
                {
                    Data = null,
                    Message = "Tạo cuộc trò chuyện thất bại - " + ex.Message,
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }
            catch (Exception ex)
            {
                return new MessageModelWithData<Aiconversation>()
                {
                    Data = null,
                    Message = "Tạo cuộc trò chuyện thất bại - lỗi hệ thống",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        public async Task<MessageModelWithData<Aiconversation>> UpdateAICurrentConversationStyle(int conversationID, string userStyleJsonString)
        {
            try
            {
                int currentUserId = _currentUserService.GetUserId();

                Aiconversation getConversation = await _aiconversationRepository.GetByIdAsync(conversationID);
                if (getConversation == null)
                {
                    throw new ArgumentException("Không tồn tại cuộc trò chuyện này");
                }
                if (getConversation.UserId != currentUserId)
                {
                    throw new ArgumentException("Bạn không có quyền để cập nhật cuộc trò chuyện này");
                }
                getConversation.CurrentUserStyleJson = userStyleJsonString;
                await _aiconversationRepository.UpdateAsync(getConversation);
                await _unitOfWork.SaveChanges();
                return new MessageModelWithData<Aiconversation>()
                {
                    Data = getConversation,
                    Message = "Cập nhật thành công phong cách cho cuộc trò chuyện AI",
                    StatusCode = StatusCodes.Status200OK
                };

            }
            catch (ArgumentException ex)
            {
                return new MessageModelWithData<Aiconversation>()
                {
                    Message = "Cập nhật thất bại - " + ex.Message,
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }
            catch (Exception ex)
            {
                return new MessageModelWithData<Aiconversation>()
                {
                    Message = "Cập nhật thất bại - Lỗi hệ thống",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }
    }
}
