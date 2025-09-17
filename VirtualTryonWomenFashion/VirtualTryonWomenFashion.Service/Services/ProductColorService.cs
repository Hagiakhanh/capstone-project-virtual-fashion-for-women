using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.ProductColor;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.Helpers.CloudinaryConfig;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class ProductColorService : IProductColorService
    {
        private readonly IProductColorRepository _productColorRepository;
        private readonly IColorService _colorService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProductVariantService _productVariantService;
        private readonly ICloudinaryService _cloudinaryService;

        public ProductColorService(IProductColorRepository productColorRepository, IColorService colorService,
            IUnitOfWork unitOfWork,
            IProductVariantService productVariantService,
            ICloudinaryService cloudinaryService) 
        {
            _productColorRepository = productColorRepository;
            _colorService = colorService;
            _unitOfWork = unitOfWork;
            _productVariantService = productVariantService;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<MessageModelWithData<ProductColor>> CreateAsync(string productId, CreateProductColorRequest request)
        {
            await _unitOfWork.BeginTransactionAsync();

            try
            {
                int colorId;

                if (request.ColorId > 0)
                {
                    // Dùng màu có sẵn
                    colorId = request.ColorId;
                }
                else
                {
                    // Tạo màu mới
                    var colorResult = await _colorService.CreateColor(
                        request.ColorName,
                        request.ColorPrefix,
                        request.HexCode
                    );

                    if (colorResult.StatusCode != StatusCodes.Status201Created)
                        //throw new Exception("Không thể tạo màu mới");
                        return new MessageModelWithData<ProductColor>
                        {
                            Message = "Tạo thất bại: Không thể tạo color lúc tạo product color",
                            StatusCode = StatusCodes.Status400BadRequest
                        };

                    colorId = colorResult.Data.ColorId;
                }

                string productColorId = $"{productId}{colorId}";

                var productColor = new ProductColor
                {
                    ProductColorId = productColorId,
                    ProductId = productId,
                    ColorId = colorId
                };

                if (request.Variants != null && request.Variants.Count != 0)
                {
                    foreach (var variant in request.Variants)
                    {
                        await _productVariantService.CreateAsync(productColorId, variant);
                    }
                }

                if (request.ProductVariantImages != null && request.ProductVariantImages.Count != 0)
                {
                    var imageUrls = await _cloudinaryService.UploadMultipleImagesAsync(request.ProductVariantImages);
                    foreach (var imageUrl in imageUrls)
                    {
                        productColor.ProductImages.Add(new ProductImage
                        {
                            ImageUrl = imageUrl
                        });
                    }
                }

                await _productColorRepository.InsertAsync(productColor);
                int result = await _unitOfWork.SaveChanges();

                //int result = await _unitOfWork.SaveChanges();

                await _unitOfWork.CommitTransactionAsync();

                if (result > 0)
                {
                    return new MessageModelWithData<ProductColor>
                    {
                        Message = "Tạo thành công ProductColor",
                        StatusCode = StatusCodes.Status201Created,
                        Data = productColor
                    };
                }
                else
                {
                    return new MessageModelWithData<ProductColor>
                    {
                        Message = "Tạo thất bại",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();

                return new MessageModelWithData<ProductColor>
                {
                    Message = "Tạo thất bại: Lỗi hệ thống",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
            
        }

    }
}
