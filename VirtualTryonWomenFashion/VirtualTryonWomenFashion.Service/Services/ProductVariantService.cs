using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.Helpers.CloudinaryConfig;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class ProductVariantService : IProductVariantService
    {
        private readonly IProductVariantRepository _productVariantRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ISizeService _sizeService;
        private readonly ICloudinaryService _cloudinaryService;

        public ProductVariantService(
            IProductVariantRepository productVariantRepository, 
            IUnitOfWork unitOfWork,
            ISizeService sizeService,
            ICloudinaryService cloudinaryService)
        {
            _productVariantRepository = productVariantRepository;
            _unitOfWork = unitOfWork;
            _sizeService = sizeService;
            _cloudinaryService = cloudinaryService;
        }
        
        public Task<ProductVariant?> GetProductVariantById(string id)
        {
            return _productVariantRepository.GetByIdAsync(id);
        }
        
        public async Task<MessageModelWithData<ProductVariant>> CreateAsync(string productColorId, CreateProductVariantRequest request)
        {
            await _unitOfWork.BeginTransactionAsync();

            try
            {
                int sizeId;

                if (request.SizeId > 0)
                {
                    // Dùng size có sẵn
                    sizeId = request.SizeId;
                }
                else
                {
                    // Tạo size mới
                    var sizeResult = await _sizeService.CreateAsync(request.SizeCode);

                    if (sizeResult.StatusCode != StatusCodes.Status201Created)
                        //throw new Exception("Không thể tạo size mới");
                        return new MessageModelWithData<ProductVariant>
                        {
                            Message = "Tạo thất bại: Không thể tạo size lúc tạo variant",
                            StatusCode = StatusCodes.Status400BadRequest

                        };

                    sizeId = sizeResult.Data.SizeId;
                }

                string productVariantId = $"{productColorId}-{sizeId}";

                var imageUrl = await _cloudinaryService.UploadImageAsync(request.ImageUrl);

                var variant = new ProductVariant
                {
                    ProductVariantId = productVariantId,
                    ProductColorId = productColorId,
                    SizeId = sizeId,
                    VariantName = request.VariantName,
                    Quantity = request.Quantity,
                    ImageUrl = imageUrl,
                    Status = "Active",
                    ProductWeight = request.ProductWeight,
                    ProductLength = request.ProductLength,
                    ProductWidth = request.ProductWidth,
                    ProductHeight = request.ProductHeight
                };

                await _productVariantRepository.InsertAsync(variant);
                int result = await _unitOfWork.SaveChanges();

                await _unitOfWork.CommitTransactionAsync();

                if (result > 0)
                {
                    return new MessageModelWithData<ProductVariant>
                    {
                        Message = "Tạo thành công ProductVariant",
                        StatusCode = StatusCodes.Status201Created,
                        Data = variant
                    };
                }
                else
                {
                    return new MessageModelWithData<ProductVariant>
                    {
                        Message = "Tạo thất bại",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }
            } catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();

                return new MessageModelWithData<ProductVariant>
                {
                    Message = "Tạo thất bại: Lỗi hệ thống",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

    }
}
