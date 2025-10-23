using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.AIChatModel;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;
using VirtualTryonWomenFashion.Service.DTO.TicketChat;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.Hubs;
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
        private readonly ISuggestedOutfitRepository _suggestedOutfitRepository;
        private readonly ITicketChatRepository _ticketChatRepository;
        private readonly IUserRepository _userRepository;
        private readonly IHubContext<TicketChatHub> _ticketChatHub;

        public MessageService(IMessageRepository messageRepository, IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService, IAiconversationRepository aiconversationRepository,
            IGeminiService geminiService, ICategoryRepository categoryRepository, IVectorDbService vectorDbService,
            IProductVariantRepository productVariantRepository, ISuggestedOutfitRepository suggestedOutfitRepository,
            ITicketChatRepository ticketChatRepository, IUserRepository userRepository, IHubContext<TicketChatHub> ticketChatHub)
        {
            _messageRepository = messageRepository;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _aiConversationRepository = aiconversationRepository;
            _geminiService = geminiService;
            _categoryRepository = categoryRepository;
            _vectorDbService = vectorDbService;
            _productVariantRepository = productVariantRepository;
            _suggestedOutfitRepository = suggestedOutfitRepository;
            _ticketChatRepository = ticketChatRepository;
            _userRepository = userRepository;
            _ticketChatHub = ticketChatHub;
        }
        public async Task<ResponseAIChatModelWithSuggestion> SendMessageToAIConversation(int conversationChatID, string message)
        {
            try
            {
                int userId = _currentUserService.GetUserId();
                Aiconversation conversationModel = await _aiConversationRepository.GetByIdAsync(conversationChatID);
                ProductReasoningSelectionResponse reasoningResponse = new();
                if (conversationModel == null)
                {
                    throw new Exception("Cuộc trò chuyện AI không hợp lệ");
                }
                if (userId != conversationModel.UserId)
                {
                    throw new Exception("Bạn không có quyền để nhắn tin cho AI ở cuộc trò chuyện này");
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
                            var varianceIds = vectorResult.Select(x => x.metadata["productVariantId"]).ToList();
                            var productVariants = await _productVariantRepository.GetAllThenInclude(null, x => varianceIds.Contains(x.ProductVariantId), null,
                                includes: [x => x.Size, x => x.ProductColor.Color, x => x.ProductColor.Product]);

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

                        reasoningResponse = JsonSerializer.Deserialize<ProductReasoningSelectionResponse>(finalOutfit.ResponseText
                            , new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                        // Có thể parse lại response nếu AI chọn ra 1 item cụ thể trong list

                        var allTrackedVariants = groupedVariants
    .SelectMany(g => g.Value)
    .ToDictionary(v => v.ProductVariantId, v => v);

                        List<ProductVariant> productVariantsSuggested = new();

                        foreach (var selected in reasoningResponse.SelectedProducts)
                        {
                            if (allTrackedVariants.TryGetValue(selected.Id, out var trackedVariant))
                            {
                                productVariantsSuggested.Add(trackedVariant); // dùng entity đã được tracking
                            }
                            else
                            {
                                // fallback: nếu AI chọn item không có trong groupedVariants thì bỏ qua
                                Console.WriteLine($"⚠️ Variant {selected.Id} not found in tracked list");
                            }
                        }
                        var options = new JsonSerializerOptions
                        {
                            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
                        };

                        string userStyleJson = JsonSerializer.Serialize(currentUserStyle, options);
                        DateTime dateSuggested = DateTime.UtcNow.AddHours(7);
                        SuggestedOutfit outfitSuggested = new SuggestedOutfit()
                        {
                            AiconversationId = conversationChatID,
                            UserStyleJson = userStyleJson,
                            IsDeleted = false,
                            Reason = reasoningResponse.ResponseText,
                            CreatedAt = dateSuggested,
                            ProductVariants = productVariantsSuggested
                        };
                        await _suggestedOutfitRepository.InsertAsync(outfitSuggested);
                        analysis.ResponseText = reasoningResponse.ResponseText;
                    }
                    else
                    {
                        finalOutfit.ResponseText = "Xin lỗi, mình chưa tìm được gợi ý phù hợp. Bạn có thể thử lại nhé.";
                        analysis.ResponseText = "Xin lỗi, mình chưa tìm được gợi ý phù hợp. Bạn có thể thử lại nhé.";
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
                    Components = reasoningResponse.SelectedProducts
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

        public async Task<MessageModel> SendMessageToTicketChat(RequestSendMessageTicket requestSendMessageTicket)
        {
            int senderId = _currentUserService.GetUserId();
            TicketChat ticketChat = await _ticketChatRepository.GetTicketChatBySlug(requestSendMessageTicket.TicketSlug);
            if (ticketChat == null)
            {
                throw new Exception("Không tìm thấy yêu cầu hỗ trợ");
            }
            if (ticketChat.Status == TicketChatStatusEnum.Closed.ToString())
            {
                throw new Exception($"Trạng thái của yêu cầu hiện tại {ticketChat.Status}, không thể gửi tin nhắn");
            }
            int customerId = ticketChat.CustomerId;
            int? assignedStaffId = ticketChat.StaffId;
            User senderUser = await _userRepository.GetUserById(senderId);
            if (senderUser == null || senderUser.Role == null)
            {
                throw new Exception("Người gửi không hợp lệ hoặc không có vai trò.");
            }

            if (senderUser.Role.RoleId == "Customer")
            {
                if (customerId != senderId)
                {
                    throw new Exception("Bạn không có quyền tham gia cuộc trò chuyện này");
                }

            }
            else if (senderUser.Role.RoleId == "Staff")
            {
                // Người gửi là staff
                if (ticketChat.Status == TicketChatStatusEnum.Open.ToString())
                {
                    if (senderId != assignedStaffId)
                    {
                        throw new UnauthorizedAccessException("Bạn không phải nhân viên phụ trách hỗ trợ này.");
                    }
                }
                else
                {
                    throw new UnauthorizedAccessException("Không có quyền gửi tin nhắn trong trạng thái này.");
                }

            }
            Message newMessage = new Message
            {
                TicketChatId = ticketChat.TicketChatId,
                SenderId = senderId,
                IsAiresponse = false,
                Content = requestSendMessageTicket.Content,
                CreatedAt = DateTime.UtcNow.AddHours(7)
            };
            await _messageRepository.InsertAsync(newMessage);
            int result = await _unitOfWork.SaveChanges();
            if (result > 0)
            {
                ResponseSendMessageTicket responseSendMessageTicket = new ResponseSendMessageTicket
                {
                    SenderId = newMessage.SenderId.Value,
                    Content = newMessage.Content,
                    CreateAt = newMessage.CreatedAt
                };
                // Broadcast dữ liệu
                await _ticketChatHub.Clients.Group(requestSendMessageTicket.TicketSlug)
                .SendAsync("ReceiveMessage", responseSendMessageTicket);

                return new MessageModel
                {
                    Message = "Gửi tin nhắn thành công",
                    StatusCode = StatusCodes.Status200OK
                };
            }
            return new MessageModel
            {
                Message = "Gửi tin nhắn thất bại",
                StatusCode = StatusCodes.Status500InternalServerError
            };

        }
    }
}
