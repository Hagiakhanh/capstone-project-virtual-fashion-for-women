using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.Product;
using VirtualTryonWomenFashion.Service.DTO.TryOnSlotModel;
using VirtualTryonWomenFashion.Service.DTO.UploadImageModel;
using VirtualTryonWomenFashion.Service.Helpers.CloudinaryConfig;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Mappers;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class TryOnSlotService : ITryOnSlotService
    {
        private readonly ITryOnSlotRepository _tryOnSlotRepository;
        private readonly IProductColorService _productColorService;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly IFitRoomService _fitRoomService;
        private readonly IProductService _productService;
        private readonly IGeminiService _geminiService;
        public TryOnSlotService(
            ITryOnSlotRepository tryOnSlotRepository,
            IProductColorService productColorService,
            ICloudinaryService cloudinaryService,
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService,
            IFitRoomService fitRoomService,
            IProductService productService,
            IGeminiService geminiService)
        {
            _tryOnSlotRepository = tryOnSlotRepository;
            _productColorService = productColorService;
            _cloudinaryService = cloudinaryService;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _fitRoomService = fitRoomService;
            _productService = productService;
            _geminiService = geminiService;
        }
        public async Task<TryOnResponse> CreateTryOnSlot(CreateTryOnRequest createTryOnRequest)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var TopProductColor = createTryOnRequest.TopProductColorId != null ? await _productColorService.GetProductColorByIdAsync(createTryOnRequest.TopProductColorId) : null;
                var BottomProductColor = createTryOnRequest.BottomProductColorId != null ? await _productColorService.GetProductColorByIdAsync(createTryOnRequest.BottomProductColorId) : null;

                var imageUserHash = ComputeSHA256(createTryOnRequest.UserModelImage);
                var existingTryOnSlot = await FindExistingTryOnSlot(imageUserHash, createTryOnRequest.TopProductColorId, createTryOnRequest.BottomProductColorId);
                if (existingTryOnSlot != null)
                {
                    return existingTryOnSlot.ToMapTryOnResponse();
                }
                
                if(TopProductColor == null && BottomProductColor == null)
                {
                    throw new Exception("Phải chọn ít nhất một sản phẩm để thử đồ");
                }

                var productColors = new List<ProductColor>();
                if (TopProductColor != null)
                    productColors.Add(TopProductColor);
                if (BottomProductColor != null)
                    productColors.Add(BottomProductColor);

                TryOnSlot newTryOnSlot = new TryOnSlot
                {
                    CustomerId = _currentUserService.GetUserId(),
                    UploadImageHash = imageUserHash,
                    ProductColors = productColors,
                    CreatedAt = DateTime.UtcNow.AddHours(7),
                    UpdatedAt = DateTime.UtcNow.AddHours(7),
                    IsDeleted = false,
                };

                var taskId = await _fitRoomService.CreateTryOnTask(
                    new TryOnModel()
                    {
                        UserModelImage = createTryOnRequest.UserModelImage,
                        TopImage = TopProductColor,
                        BottomImage = BottomProductColor
                    }
                );

                newTryOnSlot.OutputTaskId = taskId;
                var userImageUrl = await _cloudinaryService.UploadImageAsync(createTryOnRequest.UserModelImage);
                newTryOnSlot.UploadImageUrl = userImageUrl;
                await _tryOnSlotRepository.InsertAsync(newTryOnSlot);
                await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();
                return newTryOnSlot.ToMapTryOnResponse();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                await _unitOfWork.RollbackTransactionAsync();
                throw new Exception(e.Message);
            }

        }

        public Task<TryOnSlot?> FindExistingTryOnSlot(string userModelImageHash, string? topProductColorId, string? bottomProductColorId)
        {
            int userId = _currentUserService.GetUserId();
            return _tryOnSlotRepository.GetExistingTryOnSlotAsync(userId, userModelImageHash, topProductColorId, bottomProductColorId);
        }

        public async Task<bool> UpdateOutputImageUrl(UpdateTryOnRequest updateTryOnRequest)
        {
            var tryOnSlot = await _tryOnSlotRepository.GetByIdAsync(updateTryOnRequest.TryOnSlotId);
            if (tryOnSlot == null)
            {
                return false;
            }
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                tryOnSlot.OutputImageUrl = await _cloudinaryService.UploadImageFromUrlAsync(updateTryOnRequest.OutputImageUrl);
                tryOnSlot.UpdatedAt = DateTime.UtcNow.AddHours(7);
                await _tryOnSlotRepository.UpdateAsync(tryOnSlot);
                await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();
                return true;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }

        }

        private static string ComputeSHA256(IFormFile file)
        {
            using (var sha256 = SHA256.Create())
            using (var stream = file.OpenReadStream())
            {
                byte[] hashBytes = sha256.ComputeHash(stream);
                return BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();
            }
        }

        public async Task<TryOnResponse?> GetTryOnSlotByIdAsync(int tryOnSlotId)
        {
            var rawTryOnSlot = await _tryOnSlotRepository.GetByIdAsync(tryOnSlotId);
            if (rawTryOnSlot == null)
            {
                return null;
            }
            return rawTryOnSlot.ToMapTryOnResponse();
        }

        public async Task<string> CheckImageModelIsValid(ImageModel imageModel)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var allowedMimeTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };

            var fileExtension = Path.GetExtension(imageModel.ImageModelFile.FileName)?.ToLowerInvariant();
            var contentType = imageModel.ImageModelFile.ContentType?.ToLowerInvariant();

            // Kiểm tra extension và MIME type
            if (!allowedExtensions.Contains(fileExtension) || !allowedMimeTypes.Contains(contentType))
            {
                throw new ArgumentException("Chỉ chấp nhận file ảnh định dạng JPG, JPEG, PNG hoặc WEBP");
            }

            int userId = _currentUserService.GetUserId();
            var imageModelHasing = ComputeSHA256(imageModel.ImageModelFile);
            bool isExistValidImage = await _tryOnSlotRepository.HasImageModelHash(userId, imageModelHasing);
            if (isExistValidImage)
            {
                return @"{""good_clothes_types"": [""upper"", ""lower"", ""full""]}";
            }
            else
            {
                return await _fitRoomService.CheckImageModelIsValid(imageModel);
            }
        }

        public async Task<Pagination<TryOnResponse>> GetHistoryTryOn(PaginationParameter paginationParameter)
        {
            int userId = _currentUserService.GetUserId();
            var rawTryOnSlot = await _tryOnSlotRepository.GetAll(
                    filter: to => to.CustomerId == userId,
                    pagination: paginationParameter,
                    orderBy: to => to.OrderByDescending(x=>x.UpdatedAt),
                    includes: to => to.ProductColors
                );

            int totalCount = await _tryOnSlotRepository.CountAsync(to => to.CustomerId == userId);
            List<TryOnResponse> tryOnResponses = rawTryOnSlot.Select(to => to.ToMapTryOnResponse()).ToList();
            return new Pagination<TryOnResponse>(tryOnResponses, totalCount, paginationParameter.PageIndex, paginationParameter.PageSize);
        }

        public async Task<TryOnResponse> GetDetailTryOnSlot(int tryOnSlotId)
        {
            int userId = _currentUserService.GetUserId();
            var detailTryOnSlot = await _tryOnSlotRepository.GetTryOnSlotById(tryOnSlotId);
            if (detailTryOnSlot == null)
                throw new Exception("Không tìm thấy lịch sử thử đồ này");

            if (userId != detailTryOnSlot.CustomerId)
                throw new Exception("Bạn không có quyền truy cập vào đây");
            List<ResponseProductDto> productResponseMapping = new List<ResponseProductDto>();

            foreach (var productColor in detailTryOnSlot.ProductColors)
            {
                var productDTO = await _productService.GetProductByProductColorIdAsyncForTryOn(productColor.ProductColorId);
                if (productDTO != null) productResponseMapping.Add(productDTO);
            }

            var tryOnResponse = detailTryOnSlot.ToMapTryOnResponse();
            tryOnResponse.TryOnProductVariant = productResponseMapping;
            return tryOnResponse;
        }

        public async Task<string> CheckImageModelIsValidGeminiIntegrate(ImageModel imageModel)
        {
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var allowedMimeTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };

            var fileExtension = Path.GetExtension(imageModel.ImageModelFile.FileName)?.ToLowerInvariant();
            var contentType = imageModel.ImageModelFile.ContentType?.ToLowerInvariant();

            // 1. Kiểm tra extension và MIME type (Logic cũ)
            if (!allowedExtensions.Contains(fileExtension) || !allowedMimeTypes.Contains(contentType))
            {
                throw new ArgumentException("Chỉ chấp nhận file ảnh định dạng JPG, JPEG, PNG hoặc WEBP");
            }

            int userId = _currentUserService.GetUserId();
            var imageModelHasing = ComputeSHA256(imageModel.ImageModelFile);
            bool isExistValidImage = await _tryOnSlotRepository.HasImageModelHash(userId, imageModelHasing);

            // 2. Kiểm tra Hash
            if (isExistValidImage)
            {
                // Trả về kết quả TỐT NHẤT (vì đã được kiểm tra trước đó)
                return JsonSerializer.Serialize(new ImageValidationResult
                {
                    IsGood = true,
                    IsWarning = false, // Hợp lệ hoàn toàn, không có cảnh báo
                    WarningMessage = null,
                    GoodClothesTypes = new List<string> { "upper", "lower", "full" }
                });
            }
            else
            {
                // 3. Gọi Gemini để phân tích tính hợp lệ của ảnh mới

                // Prompt chi tiết yêu cầu Gemini trả về JSON với logic Good/Warning/Invalid
                var geminiPrompt = "Phân tích hình ảnh này để xác định sự phù hợp cho Thử Đồ Ảo (Virtual Try-On). Trả về kết quả dưới dạng JSON thuần (RAW JSON) theo cấu trúc sau: { \"is_good\": [true/false], \"is_warning\": [true/false], \"warning_message\": \"[Thông điệp cảnh báo nếu is_warning là true, nếu không thì để trống]\", \"good_clothes_types\": [\"upper\", \"lower\", \"full\" hoặc mảng rỗng] }. " +
                                   "Quy tắc phân loại: " +
                                   "1. Hợp lệ (is_good: true, is_warning: false): Ảnh một người mẫu **nữ**, đứng thẳng, rõ ràng, thấy toàn thân và có thể tách nền tốt. " +
                                   "2. Cảnh báo (is_good: false, is_warning: true): Ảnh một người mẫu là **nam** hoặc là **trẻ em/em bé**. `warning_message` phải mô tả rõ lý do cảnh báo (Ví dụ: 'Ảnh là người mẫu nam, có thể không phù hợp với các mẫu đồ nữ.'). `good_clothes_types` là mảng rỗng. " +
                                   "3. Không hợp lệ (is_good: false, is_warning: false): Ảnh không có người, ảnh động vật, hoặc ảnh người không rõ ràng. `good_clothes_types` là mảng rỗng." +
                                   "Hãy trả lời CHỈ bằng đối tượng JSON.";

                // Sử dụng hàm chung CallGeminiWithMediaAsync
                string rawGeminiJson = await _geminiService.CallGeminiWithMediaAsync(
                    prompt: geminiPrompt,
                    mediaFile: imageModel.ImageModelFile
                );

                // 4. Xử lý và Lưu trữ Hash nếu ảnh Hợp lệ hoàn toàn
                try
                {
                    var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                    var geminiResult = JsonSerializer.Deserialize<ImageValidationResult>(rawGeminiJson, options);

                    // Chỉ lưu Hash vào DB nếu ảnh hợp lệ VÀ không có cảnh báo
                    if (geminiResult != null && geminiResult.IsGood && !geminiResult.IsWarning)
                    {
                        // Logic: Lưu Hash vào DB để dùng lại lần sau
                        // await _tryOnSlotRepository.SaveImageModelHash(userId, imageModelHasing); 
                    }

                    // Trả về kết quả JSON từ Gemini (bao gồm cả trạng thái Warning)
                    return rawGeminiJson;
                }
                catch (JsonException)
                {
                    // Trường hợp Gemini trả về JSON không đúng format, coi là cảnh báo lỗi hệ thống
                    return @"{""is_good"": false, ""is_warning"": true, ""warning_message"": ""Không thể phân tích dữ liệu trả về từ hệ thống AI. Vui lòng thử lại."", ""good_clothes_types"": []}";
                }
            }
        }
        
    }
}
