using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
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
        public TryOnSlotService(
            ITryOnSlotRepository tryOnSlotRepository,
            IProductColorService productColorService,
            ICloudinaryService cloudinaryService,
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService,
            IFitRoomService fitRoomService)
        {
            _tryOnSlotRepository = tryOnSlotRepository;
            _productColorService = productColorService;
            _cloudinaryService = cloudinaryService;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _fitRoomService = fitRoomService;
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

                var productColors = new List<ProductColor>();
                if (TopProductColor != null)
                    productColors.Add(TopProductColor);
                if (BottomProductColor != null)
                    productColors.Add(BottomProductColor);

                TryOnSlot newTryOnSlot = new TryOnSlot
                {
                    CustomerId = _currentUserService.GetUserId(),
                    UploadImageBinary = imageUserHash,
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
                tryOnSlot.OutputImageUrl = updateTryOnRequest.OutputImageUrl;
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
    }
}
