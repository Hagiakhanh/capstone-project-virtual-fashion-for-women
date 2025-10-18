using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.Product;
using VirtualTryonWomenFashion.Service.DTO.ProductColor;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;
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
        private readonly IMapper _mapper;

        public ProductColorService(IProductColorRepository productColorRepository, 
            IColorService colorService,
            IUnitOfWork unitOfWork,
            IProductVariantService productVariantService,
            ICloudinaryService cloudinaryService,
            IMapper mapper)
        {
            _productColorRepository = productColorRepository;
            _colorService = colorService;
            _unitOfWork = unitOfWork;
            _productVariantService = productVariantService;
            _cloudinaryService = cloudinaryService;
            _mapper = mapper;
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

                string noBgImageUrl = await _cloudinaryService.UploadImageAsync(request.NoBgImgUrl);

                var productColor = new ProductColor
                {
                    ProductColorId = productColorId,
                    ProductId = productId,
                    NoBgImgUrl = noBgImageUrl,
                    LensId = request.LensId,
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

        public async Task<ProductColor> GetProductColorByIdAsync(string productColorId)
        {
            var productColor = await _productColorRepository.GetProductColorByIdAsync(productColorId);

            if (productColor == null)
                return null;
            return productColor;
        }

        public async Task<MessageModelWithData<ProductColor>> UpdateAsync(string productColorId, UpdateProductColorDto request)
        {
            await _unitOfWork.BeginTransactionAsync();

            try
            {
                // 1. Tìm ProductColor hiện tại (kèm variants, images)
                var existingColor = await _productColorRepository.GetByIdWithVariantsAsync(productColorId);
                if (existingColor == null)
                {
                    return new MessageModelWithData<ProductColor>
                    {
                        Message = "Không tìm thấy ProductColor cần cập nhật",
                        StatusCode = StatusCodes.Status404NotFound
                    };
                }

                int colorId = (int)existingColor.ColorId;

                // 2. Nếu có ColorId mới hoặc muốn tạo color mới
                if (request.ColorId > 0 && request.ColorId != colorId)
                {
                    colorId = (int)request.ColorId;
                }
                else if (!string.IsNullOrEmpty(request.ColorName))
                {
                    var colorResult = await _colorService.CreateColor(
                        request.ColorName,
                        request.ColorPrefix,
                        request.HexCode
                    );

                    if (colorResult.StatusCode != StatusCodes.Status201Created)
                    {
                        return new MessageModelWithData<ProductColor>
                        {
                            Message = "Cập nhật thất bại: Không thể tạo color mới",
                            StatusCode = StatusCodes.Status400BadRequest
                        };
                    }

                    colorId = colorResult.Data.ColorId;
                }

                // 3. Nếu có ảnh NoBgImgUrl mới thì upload
                string noBgImgUrl = existingColor.NoBgImgUrl;
                if (request.NoBgImgUrl != null)
                {
                    noBgImgUrl = await _cloudinaryService.UploadImageAsync(request.NoBgImgUrl);
                }

                // 4. Update các thuộc tính cơ bản
                existingColor.ColorId = colorId;
                existingColor.NoBgImgUrl = noBgImgUrl;
                existingColor.LensId = request.LensId ?? existingColor.LensId;

                // 5. Xử lý Variants (Add - Update - Delete)
                if (request.Variants != null)
                {
                    var dbVariants = existingColor.ProductVariants.ToList();
                    var requestVariantIds = request.Variants
                        .Where(v => !string.IsNullOrEmpty(v.ProductVariantId))
                        .Select(v => v.ProductVariantId)
                        .ToList();

                    foreach (var variantRequest in request.Variants)
                    {
                        var dbVariant = dbVariants
                            .FirstOrDefault(v => v.ProductVariantId == variantRequest.ProductVariantId);

                        string variantImgUrl = await _cloudinaryService.UploadImageAsync(variantRequest.ImageUrl);

                        if (dbVariant == null)
                        {
                            // Thêm mới
                            existingColor.ProductVariants.Add(new ProductVariant
                            {
                                ProductVariantId = string.IsNullOrEmpty(variantRequest.ProductVariantId)
                                    ? Guid.NewGuid().ToString()
                                    : variantRequest.ProductVariantId,
                                ProductColorId = productColorId,
                                SizeId = variantRequest.SizeId,
                                VariantName = variantRequest.VariantName,
                                Quantity = variantRequest.Quantity,
                                ImageUrl = variantImgUrl,
                                Status = variantRequest.Status ?? "Active",
                                ProductWeight = variantRequest.ProductWeight,
                                ProductLength = variantRequest.ProductLength,
                                ProductWidth = variantRequest.ProductWidth,
                                ProductHeight = variantRequest.ProductHeight
                            });
                        }
                        else
                        {
                            // Cập nhật
                            dbVariant.SizeId = variantRequest.SizeId;
                            dbVariant.VariantName = variantRequest.VariantName;
                            dbVariant.Quantity = variantRequest.Quantity;
                            dbVariant.ImageUrl = variantImgUrl;
                            dbVariant.Status = variantRequest.Status ?? dbVariant.Status;
                            dbVariant.ProductWeight = variantRequest.ProductWeight;
                            dbVariant.ProductLength = variantRequest.ProductLength;
                            dbVariant.ProductWidth = variantRequest.ProductWidth;
                            dbVariant.ProductHeight = variantRequest.ProductHeight;
                        }
                    }

                    // Xóa những variant không còn trong request
                    var toRemove = dbVariants
                        .Where(v => !requestVariantIds.Contains(v.ProductVariantId)).Select(v => v.ProductVariantId)
                        .ToList();

                    foreach (var id in toRemove)
                    {
                        await _productVariantService.DeleteAsync(id);
                    }
                }

                // 6. Upload thêm ProductVariantImages nếu có
                if (request.ProductVariantImages != null && request.ProductVariantImages.Any())
                {
                    var imageUrls = await _cloudinaryService.UploadMultipleImagesAsync(request.ProductVariantImages);
                    foreach (var imageUrl in imageUrls)
                    {
                        existingColor.ProductImages.Add(new ProductImage
                        {
                            ImageUrl = imageUrl
                        });
                    }
                }

                // 7. Update DB
                await _productColorRepository.UpdateAsync(existingColor);
                int result = await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();

                if (result > 0)
                {
                    return new MessageModelWithData<ProductColor>
                    {
                        Message = "Cập nhật thành công ProductColor",
                        StatusCode = StatusCodes.Status200OK,
                        Data = existingColor
                    };
                }

                return new MessageModelWithData<ProductColor>
                {
                    Message = "Cập nhật thất bại",
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new MessageModelWithData<ProductColor>
                {
                    Message = "Cập nhật thất bại: Lỗi hệ thống",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }



        public async Task<MessageModel> DeleteAsync(string productColorId)
        {
            await _unitOfWork.BeginTransactionAsync();

            try
            {
                // Tìm productColor
                var productColor = await _productColorRepository.GetByIdAsync(productColorId);

                if (productColor == null)
                {
                    return new MessageModel
                    {
                        Message = "Không tìm thấy ProductColor",
                        StatusCode = StatusCodes.Status404NotFound
                    };
                }

                // Xóa ảnh nền (NoBgImgUrl) nếu có
                /*if (!string.IsNullOrEmpty(productColor.NoBgImgUrl))
                {
                    await _cloudinaryService.DeleteImageAsync(productColor.NoBgImgUrl);
                }

                // Xóa ảnh product images
                if (productColor.ProductImages != null && productColor.ProductImages.Any())
                {
                    foreach (var image in productColor.ProductImages)
                    {
                        if (!string.IsNullOrEmpty(image.ImageUrl))
                        {
                            await _cloudinaryService.DeleteImageAsync(image.ImageUrl);
                        }
                    }
                }*/

                // Xóa các variants liên quan
                if (productColor.ProductVariants != null && productColor.ProductVariants.Any())
                {
                    foreach (var variant in productColor.ProductVariants.ToList())
                    {
                        await _productVariantService.DeleteAsync(variant.ProductVariantId);
                    }
                }

                // Xóa ProductColor
                await _productColorRepository.Delete(productColor);

                int result = await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();

                if (result > 0)
                {
                    return new MessageModel
                    {
                        Message = "Xóa thành công ProductColor",
                        StatusCode = StatusCodes.Status200OK
                    };
                }

                return new MessageModel
                {
                    Message = "Xóa thất bại",
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();

                return new MessageModel
                {
                    Message = $"Xóa thất bại: {ex.Message}",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }
    }
}
