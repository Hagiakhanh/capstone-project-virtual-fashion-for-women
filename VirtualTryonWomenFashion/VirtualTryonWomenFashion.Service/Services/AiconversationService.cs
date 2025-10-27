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
        private readonly ICategoryService _categoryService;
        public AiconversationService(IAiconversationRepository aiconversationRepository, ICurrentUserService currentUserService,
            ICharacteristicService characteristicService, IUnitOfWork unitOfWork, IGeminiService geminiService, ICategoryService categoryService)
        {
            _aiconversationRepository = aiconversationRepository;
            _currentUserService = currentUserService;
            _characteristicService = characteristicService;
            _unitOfWork = unitOfWork;
            _geminiService = geminiService;
            _categoryService = categoryService;
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
                    List<Category> categories = await _categoryService.GetAllCategories();
                    string prompt = PromptHelper.BuildConversationalStylistPrompt(null, null, categories, "Tôi là người mới mong muốn được gợi ý và có phong cách " + characteristicDescribe);
                    string geminiJsonResponse = await _geminiService.CallGeminiAsync(prompt);
                    var cleanJson = JsonHelper.CleanJsonString(geminiJsonResponse);

                    var analysis = JsonSerializer.Deserialize<OutfitPlanResponse>(cleanJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    var options = new JsonSerializerOptions
                    {
                        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
                        WriteIndented = true
                    };
                    aiConversation.Messages.Add(new Message() { Content = "Tôi là người mới mong muốn được gợi ý và có phong cách " + characteristicDescribe, SenderId = currentUserId, IsAiresponse = false, CreatedAt = DateTime.UtcNow.AddHours(7) });
                    aiConversation.CurrentUserStyleJson = JsonSerializer.Serialize(analysis.UpdatedStyle, options);
                    aiConversation.Messages.Add(new Message() { Content = analysis.ResponseText, SenderId = null, ReceiverId = currentUserId, IsAiresponse = true, CreatedAt = DateTime.UtcNow.AddHours(7) });

                }
                aiConversation.CreatedAt = DateTime.UtcNow.AddHours(7);
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

        public async Task<MessageModel> DeleteConversationById(int conversationID)
        {
            try
            {
                int currentUserId = _currentUserService.GetUserId();
                Aiconversation detailConversation = await _aiconversationRepository.GetByIdAsync(conversationID);

                if (detailConversation == null || detailConversation.IsDeleted)
                {
                    throw new ArgumentException("Cuộc trò chuyện không tồn tại để xoá");
                }
                if (detailConversation.UserId != currentUserId)
                {
                    throw new ArgumentException("Bạn không có quyền để xoá cuộc trò chuyện này");
                }
                detailConversation.IsDeleted = true;
                await _aiconversationRepository.UpdateAsync(detailConversation);
                int executeResult = await _unitOfWork.SaveChanges();
                if (executeResult > 0)
                {
                    return new MessageModel
                    {
                        Message = "Xoá thành công cuộc trò chuyện này",
                        StatusCode = StatusCodes.Status200OK,
                    };

                }
                return new MessageModel
                {
                    Message = "Xoá thất bại cuộc trò chuyện này",
                    StatusCode = StatusCodes.Status400BadRequest,
                };


            }
            catch (ArgumentException ex)
            {
                return new MessageModel
                {
                    Message = ex.Message,
                    StatusCode = StatusCodes.Status400BadRequest,
                };
            }
            catch (Exception ex)
            {
                return new MessageModel
                {
                    Message = "Xoá thất bại cuộc trò chuyện này",
                    StatusCode = StatusCodes.Status500InternalServerError,
                };
            }
        }

        public async Task<List<Aiconversation>> GetAllAIConversation()
        {
            try
            {
                int currentUserId = _currentUserService.GetUserId();
                List<Aiconversation> listConversation = await _aiconversationRepository.GetAll(null, x => x.UserId == currentUserId);
                return listConversation;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async Task<Aiconversation> GetConversationDetailByID(int id)
        {
            int currentUserId = _currentUserService.GetUserId();
            List<Aiconversation> listConversation = await _aiconversationRepository.GetAll(null, x => x.UserId == currentUserId && x.AiconversationId == id
            , x => x.OrderBy(x => x.CreatedAt), [x => x.SuggestedOutfits, x => x.Messages]);
            return listConversation.FirstOrDefault();
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
