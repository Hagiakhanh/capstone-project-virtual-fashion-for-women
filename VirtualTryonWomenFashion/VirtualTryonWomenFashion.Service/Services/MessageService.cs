using Microsoft.EntityFrameworkCore;
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
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;
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
        private readonly ICategoryRepository _categoryRepository;
        private readonly IVectorDbService _vectorDbService;
        private readonly IProductVariantRepository _productVariantRepository;
        public MessageService(IMessageRepository messageRepository, IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService, IAiconversationRepository aiconversationRepository,
            IGeminiService geminiService, ICategoryRepository categoryRepository, IVectorDbService vectorDbService, IProductVariantRepository productVariantRepository)
        {
            _messageRepository = messageRepository;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _aiConversationRepository = aiconversationRepository;
            _geminiService = geminiService;
            _categoryRepository = categoryRepository;
            _vectorDbService = vectorDbService;
            _productVariantRepository = productVariantRepository;
        }
        public async Task<ResponseAIChatModelWithSuggestion> SendMessageToAIConversation(int conversationChatID, string message)
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
                List<Category> listCategory = await _categoryRepository.GetAll();
                string prompt = PromptHelper.BuildConversationalStylistPrompt(listHistoryMessage, currentUserStyle, listCategory, message);
                string geminiJsonResponse = await _geminiService.CallGeminiAsync(prompt);

                var cleanJson = JsonHelper.CleanJsonString(geminiJsonResponse);
                var analysis = JsonSerializer.Deserialize<OutfitPlanResponse>(cleanJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                // Dieu chinh lai cau prompt va cau hinh cho phan tra ve chi yeu cau phoi theo dung bo quan ao theo phong cach qua tu khoa

                var finalOutfit = new OutfitDTO
                {
                    OutfitName = analysis.OutfitName,
                    ResponseText = analysis.ResponseText
                };
                if (HasChanges(currentUserStyle, analysis.UpdatedStyle))
                {
                    var options = new JsonSerializerOptions
                    {
                        Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
                        WriteIndented = true
                    };

                    conversationModel.CurrentUserStyleJson = JsonSerializer.Serialize(analysis.UpdatedStyle, options);
                    currentUserStyle = analysis.UpdatedStyle;
                    await _aiConversationRepository.UpdateAsync(conversationModel);
                }
                if (analysis.Action == "provide_suggestions" && analysis.Components != null)
                {
                    // Dictionary gom list sản phẩm theo loại
                    var groupedVariants = new Dictionary<string, List<ProductVariant>>();

                    foreach (var componentPlan in analysis.Components)
                    {
                        //if (currentUserStyle.Weight.HasValue && currentUserStyle.Height.HasValue)
                        //{
                        //    var size = SizeHelper.GetFemaleSize(currentUserStyle.Height.Value, currentUserStyle.Weight.Value);
                        //    componentPlan.Filters["size"] = size;
                        //}

                        float[] embeddedQuery = await _geminiService.GetEmbeddingAsync(componentPlan.SearchQuery);

                        // Query nhiều sản phẩm cho mỗi loại
                        var vectorResult = await _vectorDbService.QueryAsync(embeddedQuery, topK: 5, filters: componentPlan.Filters);

                        if (vectorResult.Any())
                        {
                            var varianceIds = vectorResult.Select(x => x.metadata["varianceId"]).ToList();
                            var productVariants = await _productVariantRepository.GetAll(null, x => varianceIds.Contains(x.ProductVariantId));

                            // Gom theo ItemType (nếu bạn muốn gom theo Category thì đổi key)
                            string key = vectorResult.FirstOrDefault().metadata["bodyPart"] ?? "unknown";
                            if (!groupedVariants.ContainsKey(key))
                                groupedVariants[key] = new List<ProductVariant>();

                            groupedVariants[key].AddRange(productVariants);
                        }
                    }

                    if (groupedVariants.Any())
                    {
                        // Tạo prompt reasoning với nhiều lựa chọn
                        string reasoningPrompt = PromptHelper.BuildStylistReasoningPrompt(
                            currentUserStyle,
                            listCategory,
                            groupedVariants,
                            analysis.ResponseText
                        );

                        string refinedResponse = await _geminiService.CallGeminiAsync(reasoningPrompt);
                        finalOutfit.ResponseText = JsonHelper.CleanJsonString(refinedResponse);

                        // Có thể parse lại response nếu AI chọn ra 1 item cụ thể trong list
                    }
                    else
                    {
                        finalOutfit.ResponseText = "Xin lỗi, mình chưa tìm được gợi ý phù hợp. Bạn có thể thử lại nhé.";
                    }
                }

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
                responseMessage.Aiconversation = null;



                //Tra ve dto voi suggested outfit neu co
                ResponseAIChatModelWithSuggestion responseToClient = new ResponseAIChatModelWithSuggestion()
                {
                    Content = responseMessage.Content,
                    CreatedAt = responseMessage.CreatedAt,
                    IsAiresponse = true,
                    Components = []
                };
                return responseToClient;
            }
            catch (Exception ex)
             {
                return null;
            }
        }

        public static bool HasChanges(SuggestRequirement oldStyle, SuggestRequirement newStyle)
        {
            // Kiểm tra trường hợp một trong hai hoặc cả hai là null
            if (oldStyle == null && newStyle == null) return false; // Cả hai đều null -> không đổi
            if (oldStyle == null || newStyle == null) return true;  // Một trong hai là null -> có đổi

            // So sánh từng thuộc tính
            if (oldStyle.Height != newStyle.Height) return true;
            if (oldStyle.Weight != newStyle.Weight) return true;
            if (oldStyle.FashionStyle != newStyle.FashionStyle) return true;
            if (oldStyle.ItemType != newStyle.ItemType) return true;
            if (oldStyle.Occasion != newStyle.Occasion) return true;
            if (oldStyle.Color != newStyle.Color) return true;

            // Nếu tất cả các thuộc tính đều giống nhau
            return false;
        }
    }
}
