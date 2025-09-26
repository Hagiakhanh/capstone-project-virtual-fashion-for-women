using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.Color;
using VirtualTryonWomenFashion.Service.DTO.Product;
using VirtualTryonWomenFashion.Service.DTO.ProductColor;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;
using VirtualTryonWomenFashion.Service.Extensions;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.Helpers.CloudinaryConfig;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class ProductService : IProductService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProductRepository _productRepository;
        /*private readonly IProductColorService _productColorService;
        private readonly IProductImageService _productImageService;
        private readonly IProductVariantService _productVariantService;*/
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IColorRepository _colorRepository;
        private readonly IProductColorRepository _productColorRepository;
        private readonly ISizeRepository _sizeRepository;
        private readonly IProductVariantRepository _productVariantRepository;
        private readonly IProductInSaleCampaignService _productInSaleCampaignService;
        private readonly IProductImageRepository _productImageRepository;
        private readonly IMapper _mapper;

        public ProductService(IUnitOfWork unitOfWork, IProductRepository productRepository,
            /*IProductColorService productColorService,
            IProductImageService productImageService,
            IProductVariantService productVariantService,*/
            ICloudinaryService cloudinaryService,
            IColorRepository colorRepository,
            IProductColorRepository productColorRepository,
            ISizeRepository sizeRepository,
            IProductVariantRepository productVariantRepository,
            IProductInSaleCampaignService productInSaleCampaignService,
            IProductImageRepository productImageRepository,
            IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _productRepository = productRepository;
            /*_productColorService = productColorService;
            _productImageService = productImageService;
            _productVariantService = productVariantService;*/
            _cloudinaryService = cloudinaryService;
            _colorRepository = colorRepository;
            _productColorRepository = productColorRepository;
            _sizeRepository = sizeRepository;
            _productVariantRepository = productVariantRepository;
            _productInSaleCampaignService = productInSaleCampaignService;
            _productImageRepository = productImageRepository;
            _mapper = mapper;
        }

        public static string GenerateFixedLengthString(int length)
        {
            using (var sha = System.Security.Cryptography.SHA256.Create())
            {
                var hash = sha.ComputeHash(Guid.NewGuid().ToByteArray());
                string baseStr = Convert.ToBase64String(hash)
                                  .Replace("=", "")
                                  .Replace("+", "")
                                  .Replace("/", "");
                string result = baseStr.Substring(0, Math.Min(length, baseStr.Length));
                return result;
            }
        }

        private async Task<string> GenerateProductSlug(string name, string? currentId = null)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Product name is required");

            // Bỏ dấu
            string noDiacritics = RemoveDiacritics(name);

            string baseSlug = noDiacritics.Trim().ToLower()
                                          .Replace(" ", "-")
                                          .Replace("--", "-");

            // Lấy toàn bộ slug trong DB có cùng prefix + id để so sánh
            var existing = await _productRepository.GetAll(); // query trực tiếp
            var existingSlugs = existing
                .Where(c => currentId == null || c.ProductId != currentId) // loại chính nó
                .Select(c => c.ProductSlug)
                .ToList();

            // Nếu slug chưa tồn tại hoặc trùng nhưng là chính nó thì giữ nguyên
            if (!existingSlugs.Contains(baseSlug))
            {
                return baseSlug;
            }

            int counter = 1;
            string newSlug;
            do
            {
                newSlug = $"{baseSlug}-{counter}";
                counter++;
            } while (existingSlugs.Contains(newSlug));

            return newSlug;
        }

        private string RemoveDiacritics(string text)
        {
            var normalized = text.Normalize(System.Text.NormalizationForm.FormD);
            var sb = new StringBuilder();

            foreach (var c in normalized)
            {
                var unicodeCategory = System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != System.Globalization.UnicodeCategory.NonSpacingMark)
                {
                    sb.Append(c);
                }
            }

            return sb.ToString().Normalize(System.Text.NormalizationForm.FormC);
        }

        public async Task<ResponsePaginationModel<List<ResponseProductDto>>> GetAllProductsAsync(PaginationParameter pagination)
        {
            var products = await _productRepository.GetAllProductsWithIncludes(pagination);

            // Get total count for pagination info
            var totalRecords = _productRepository.Count(p => p.IsDeleted != true);
            var totalPages = (int)Math.Ceiling((double)totalRecords / pagination.PageSize);

            // Map to DTOs (await từng product)
            var productDtos = await Task.WhenAll(products.Select(p => MapToResponseProductDto(p)));

            return new ResponsePaginationModel<List<ResponseProductDto>>(
                statusCode: 200,
                data: productDtos.ToList(),
                totalRecords: totalRecords,
                totalPages: totalPages
            );
        }

        private async Task<ResponseProductDto> MapToResponseProductDto(Product product)
        {
            // lấy giá trong campaign
            var productActiveInSaleCapaign =
                _productInSaleCampaignService.GetPriceOfProductInActiveCampaign(product.ProductId);

            // map entity -> dto
            var dto = _mapper.Map<ResponseProductDto>(product);

            // custom PriceAtTime
            dto.PriceAtTime = productActiveInSaleCapaign.Result != null
                ? productActiveInSaleCapaign.Result.SalePrice
                : product.Price;

            return dto;
        }

        public async Task<ResponseProductDto> GetProductBySlugAsync(string slug)
        {
            var product = await _productRepository.GetProductBySlugAsync(slug);
            if (product == null)
                return null;

            return await MapToResponseProductDto(product);
        }

        public async Task<ResponseProductDto> GetProductByVariantIdAsync(string variantId)
        {
            var product = await _productRepository.GetProductByVariantIdAsync(variantId);
            if (product == null)
                return null;
            return MapToResponseProductDtoForVariant(product, variantId);
        }

        private ResponseProductDto MapToResponseProductDtoForVariant(Product product, string variantId)
        {
            var productActiveInSaleCampaign = _productInSaleCampaignService.GetPriceOfProductInActiveCampaign(product.ProductId);
            // Tìm ProductColor chứa variant được yêu cầu
            var targetProductColor = product.ProductColors
                .FirstOrDefault(pc => pc.ProductVariants.Any(pv => pv.ProductVariantId == variantId));

            if (targetProductColor == null)
                return null;

            // Tìm variant được yêu cầu
            var targetVariant = targetProductColor.ProductVariants
                .FirstOrDefault(pv => pv.ProductVariantId == variantId);

            if (targetVariant == null)
                return null;

            // Map product sang ResponseProductDto
            var response = _mapper.Map<ResponseProductDto>(product);

            // Set giá ở thời điểm hiện tại
            response.PriceAtTime = productActiveInSaleCampaign.Result != null
                ? productActiveInSaleCampaign.Result.SalePrice
                : product.Price;

            // Chỉ giữ lại đúng 1 ProductColor và 1 Variant
            response.ProductColors = new List<ResponseProductColorDto>
            {
                new ResponseProductColorDto
                {
                    ProductColorId = targetProductColor.ProductColorId,
                    ColorId = targetProductColor.ColorId,
                    LensId = targetProductColor.LensId,
                    Color = _mapper.Map<ResponseColorDto>(targetProductColor.Color),
                    ProductVariants = new List<ResponseProductVariantDto>
                    {
                        new ResponseProductVariantDto
                        {
                            ProductVariantId = targetVariant.ProductVariantId,
                            SizeId = targetVariant.SizeId,
                            VariantName = targetVariant.VariantName,
                            Quantity = targetVariant.Quantity,
                            ImageUrl = targetVariant.ImageUrl,
                            Status = targetVariant.Status,
                            ProductWeight = targetVariant.ProductWeight,
                            ProductLength = targetVariant.ProductLength,
                            ProductWidth = targetVariant.ProductWidth,
                            ProductHeight = targetVariant.ProductHeight,
                            SizeDto = _mapper.Map<ResponseSizeDto>(targetVariant.Size),
                            ProductImagesDto = targetProductColor.ProductImages
                                .Select(pi => _mapper.Map<ResponseProductImageDto>(pi))
                                .ToList()
                        }
                    }
                }
            };

            return response;
        }

        public async Task<ResponsePaginationModel<List<ResponseProductDto>>> SearchProductAsync(
            ProductSearchRequest request,
            PaginationParameter pagination)
        {
            // Lấy danh sách product theo filter + sort
            var products = await _productRepository.SearchProductsWithIncludes(request.ProductName, request.ProductSort.ToString(), pagination);

            // Đếm tổng record (áp dụng filter nhưng bỏ phân trang)
            var totalRecords = await _productRepository.CountSearchProductsAsync(request.ProductName);
            var totalPages = (int)Math.Ceiling((double)totalRecords / pagination.PageSize);

            // Map sang DTO
            var productDtos = await Task.WhenAll(products.Select(p => MapToResponseProductDto(p)));

            return new ResponsePaginationModel<List<ResponseProductDto>>(
                statusCode: 200,
                data: productDtos.ToList(),
                totalRecords: totalRecords,
                totalPages: totalPages
            );
        }


        public async Task<MessageModelWithData<Product>> CreateProductAsync(CreateProductRequest request)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // 1. Tạo Product
                var product = new Product
                {
                    ProductId = GenerateFixedLengthString(16),
                    ProductName = request.ProductName,
                    ProductSlug = await GenerateProductSlug(request.ProductName),
                    Description = request.Description,
                    MainImageUrl = await _cloudinaryService.UploadImageAsync(request.MainImageUrl),
                    CreatedAt = DateTime.UtcNow.AddHours(7),
                    CategoryId = request.CategoryId,
                    Price = request.Price,
                };
                await _productRepository.InsertAsync(product);

                // 2. Tạo ProductColors + Images + Variants
                foreach (var productColorRequest in request.ProductColor)
                {
                    // 2.1. Xử lý Color
                    int colorId;
                    if (productColorRequest.ColorId > 0)
                    {
                        // Dùng màu có sẵn
                        colorId = productColorRequest.ColorId;
                    }
                    else
                    {
                        // Kiểm tra màu đã tồn tại chưa
                        var existingColor = await _colorRepository.GetFirstOrDefaultAsync(
                            x => x.ColorPrefix.Equals(productColorRequest.ColorPrefix, StringComparison.InvariantCultureIgnoreCase));

                        if (existingColor != null)
                        {
                            colorId = existingColor.ColorId;
                        }
                        else
                        {
                            // Tạo màu mới
                            var newColor = new Color
                            {
                                ColorPrefix = productColorRequest.ColorPrefix,
                                HexCode = productColorRequest.HexCode,
                                ColorName = productColorRequest.ColorName,
                            };
                            await _colorRepository.InsertAsync(newColor);
                            await _unitOfWork.SaveChanges(); // Save để lấy ColorId
                            colorId = newColor.ColorId;
                        }
                    }

                    // 2.2. Tạo ProductColor
                    string productColorId = $"{product.ProductId}-{colorId}";

                    string noBgImageUrl = await _cloudinaryService.UploadImageAsync(productColorRequest.NoBgImgUrl);

                    var productColor = new ProductColor
                    {
                        ProductColorId = productColorId,
                        ProductId = product.ProductId,
                        NoBgImgUrl = noBgImageUrl,
                        LensId = productColorRequest.LensId,
                        ColorId = colorId
                    };

                    // 2.3. Tạo ProductImages
                    if (productColorRequest.ProductVariantImages != null && productColorRequest.ProductVariantImages.Count > 0)
                    {
                        var imageUrls = await _cloudinaryService.UploadMultipleImagesAsync(productColorRequest.ProductVariantImages);
                        foreach (var imageUrl in imageUrls)
                        {
                            productColor.ProductImages.Add(new ProductImage
                            {
                                ImageUrl = imageUrl
                            });
                        }
                    }

                    await _productColorRepository.InsertAsync(productColor);

                    // 2.4. Tạo ProductVariants
                    if (productColorRequest.Variants != null && productColorRequest.Variants.Count > 0)
                    {
                        foreach (var variantRequest in productColorRequest.Variants)
                        {
                            // Xử lý Size
                            int sizeId;
                            if (variantRequest.SizeId > 0)
                            {
                                // Dùng size có sẵn
                                sizeId = variantRequest.SizeId;
                            }
                            else
                            {
                                // Kiểm tra size đã tồn tại chưa
                                var existingSize = await _sizeRepository.GetFirstOrDefaultAsync(
                                    x => x.SizeCode.Equals(variantRequest.SizeCode, StringComparison.InvariantCultureIgnoreCase));

                                if (existingSize != null)
                                {
                                    sizeId = existingSize.SizeId;
                                }
                                else
                                {
                                    // Tạo size mới
                                    var newSize = new Size
                                    {
                                        SizeCode = variantRequest.SizeCode,
                                    };
                                    await _sizeRepository.InsertAsync(newSize);
                                    await _unitOfWork.SaveChanges(); // Save để lấy SizeId
                                    sizeId = newSize.SizeId;
                                }
                            }

                            // Tạo ProductVariant
                            string productVariantId = $"{productColorId}-{sizeId}";
                            var imageUrl = await _cloudinaryService.UploadImageAsync(variantRequest.ImageUrl);

                            var variant = new ProductVariant
                            {
                                ProductVariantId = productVariantId,
                                ProductColorId = productColorId,
                                SizeId = sizeId,
                                VariantName = variantRequest.VariantName,
                                Quantity = variantRequest.Quantity,
                                ImageUrl = imageUrl,
                                Status = "Active",
                                ProductWeight = variantRequest.ProductWeight,
                                ProductLength = variantRequest.ProductLength,
                                ProductWidth = variantRequest.ProductWidth,
                                ProductHeight = variantRequest.ProductHeight
                            };

                            await _productVariantRepository.InsertAsync(variant);
                        }
                    }
                }

                // 3. Save tất cả changes
                var result = await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();

                if (result > 0)
                {
                    return new MessageModelWithData<Product>
                    {
                        Message = "Tạo sản phẩm thành công",
                        StatusCode = StatusCodes.Status201Created,
                        Data = product
                    };
                }

                return new MessageModelWithData<Product>
                {
                    Message = "Tạo thất bại",
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new MessageModelWithData<Product>
                {
                    Message = $"Tạo thất bại: {ex.Message}",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        // Helper method để validate dữ liệu trước khi tạo
        private async Task<(bool IsValid, string ErrorMessage)> ValidateCreateProductRequest(CreateProductRequest request)
        {
            // Validate Product
            if (string.IsNullOrWhiteSpace(request.ProductName))
                return (false, "Tên sản phẩm không được để trống");

            // Validate ProductColors
            if (request.ProductColor == null || !request.ProductColor.Any())
                return (false, "Sản phẩm phải có ít nhất một màu");

            // validate Price 
            if (request.Price <= 0) return (false, "Giá sản phẩm phải lớn hơn 0");

            foreach (var colorRequest in request.ProductColor)
            {
                // Nếu không dùng ColorId có sẵn thì phải có đủ thông tin để tạo Color mới
                if (colorRequest.ColorId <= 0)
                {
                    if (string.IsNullOrWhiteSpace(colorRequest.ColorName) ||
                        string.IsNullOrWhiteSpace(colorRequest.ColorPrefix) ||
                        string.IsNullOrWhiteSpace(colorRequest.HexCode))
                    {
                        return (false, "Thông tin màu không đầy đủ");
                    }
                }

                // Validate Variants
                if (colorRequest.Variants != null)
                {
                    foreach (var variant in colorRequest.Variants)
                    {
                        if (variant.SizeId <= 0 && string.IsNullOrWhiteSpace(variant.SizeCode))
                            return (false, "Thông tin size không đầy đủ");

                        //if (variant.Price <= 0)
                        //    return (false, "Giá sản phẩm phải lớn hơn 0");

                        if (variant.Quantity < 0)
                            return (false, "Số lượng không được âm");
                    }
                }
            }

            return (true, string.Empty);
        }

        // Cập nhật method CreateProductAsync để có validation
        public async Task<MessageModelWithData<Product>> CreateProductAsyncWithValidation(CreateProductRequest request)
        {
            // Validate dữ liệu trước
            var validation = await ValidateCreateProductRequest(request);
            if (!validation.IsValid)
            {
                return new MessageModelWithData<Product>
                {
                    Message = $"Dữ liệu không hợp lệ: {validation.ErrorMessage}",
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            return await CreateProductAsync(request);
        }

        public async Task<MessageModelWithData<Product>> UpdateAsync(string productId, UpdateProductRequest request)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var existingProduct = await _productRepository.GetByIdAsync(productId);
                if (existingProduct == null)
                {
                    return new MessageModelWithData<Product>
                    {
                        Message = "Không tìm thấy Product",
                        StatusCode = StatusCodes.Status404NotFound
                    };
                }

                // ================== UPDATE PRODUCT FIELDS ==================
                existingProduct.ProductName = request.ProductName ?? existingProduct.ProductName;
                existingProduct.Description = request.Description ?? existingProduct.Description;
                existingProduct.CategoryId = request.CategoryId ?? existingProduct.CategoryId;

                if (request.MainImageUrl != null)
                {
                    existingProduct.MainImageUrl = await _cloudinaryService.UploadImageAsync(request.MainImageUrl);
                }

                // ================== KIỂM TRA VÀ CẬP NHẬT GIÁ ==================
                if (request.Price.HasValue && request.Price != existingProduct.Price)
                {
                    // Kiểm tra xem sản phẩm có đang trong sale campaign không
                    var productInSaleCampaigns = await _productInSaleCampaignService.GetProductInSaleCampaign(productId);

                    if (productInSaleCampaigns != null && productInSaleCampaigns.Any())
                    {
                        return new MessageModelWithData<Product>
                        {
                            Message = "Không thể cập nhật giá sản phẩm vì đang trong chiến dịch sale",
                            StatusCode = StatusCodes.Status400BadRequest
                        };
                    }

                    existingProduct.Price = request.Price.Value;
                }

                // ================== LẤY PRODUCT COLORS TỪ DB ==================
                var dbColors = await _productColorRepository.GetAll(
                    filter: x => x.ProductId == productId,
                    includes: x => x.ProductVariants);

                var requestColorIds = request.ProductColor
                    .Where(c => !string.IsNullOrEmpty(c.ProductColorId))
                    .Select(c => c.ProductColorId)
                    .ToList();

                // ================== ADD/UPDATE COLOR ==================
                foreach (var colorReq in request.ProductColor)
                {
                    ProductColor? dbColor = null;
                    if (!string.IsNullOrEmpty(colorReq.ProductColorId))
                    {
                        dbColor = dbColors.FirstOrDefault(c => c.ProductColorId == colorReq.ProductColorId);
                    }

                    // Nếu chưa có trong DB → thêm mới
                    if (dbColor == null)
                    {
                        // 2.1. Xử lý Color
                        int colorId;
                        if (colorReq.ColorId.HasValue && colorReq.ColorId > 0)
                        {
                            // Dùng màu có sẵn
                            colorId = colorReq.ColorId.Value;
                        }
                        else
                        {
                            // Kiểm tra màu đã tồn tại chưa
                            var existingColor = await _colorRepository.GetFirstOrDefaultAsync(
                                x => x.ColorPrefix.Equals(colorReq.ColorPrefix, StringComparison.InvariantCultureIgnoreCase));

                            if (existingColor != null)
                            {
                                colorId = existingColor.ColorId;
                            }
                            else
                            {
                                // Tạo màu mới
                                var newColor = new Color
                                {
                                    ColorPrefix = colorReq.ColorPrefix,
                                    HexCode = colorReq.HexCode,
                                    ColorName = colorReq.ColorName,
                                };
                                await _colorRepository.InsertAsync(newColor);
                                await _unitOfWork.SaveChanges(); // Save để lấy ColorId
                                colorId = newColor.ColorId;
                            }
                        }

                        string productColorId = string.IsNullOrEmpty(colorReq.ProductColorId)
                            ? $"{productId}-{colorId}"
                            : colorReq.ProductColorId;

                        string noBgImageUrl = colorReq.NoBgImgUrl != null
                            ? await _cloudinaryService.UploadImageAsync(colorReq.NoBgImgUrl)
                            : string.Empty;

                        var newProductColor = new ProductColor
                        {
                            ProductColorId = productColorId,
                            ProductId = productId,
                            NoBgImgUrl = noBgImageUrl,
                            LensId = colorReq.LensId,
                            ColorId = colorId
                        };

                        // 2.3. Tạo ProductImages
                        if (colorReq.ProductVariantImages != null && colorReq.ProductVariantImages.Count > 0)
                        {
                            var imageUrls = await _cloudinaryService.UploadMultipleImagesAsync(colorReq.ProductVariantImages);
                            foreach (var imageUrl in imageUrls)
                            {
                                newProductColor.ProductImages.Add(new ProductImage
                                {
                                    ImageUrl = imageUrl
                                });
                            }
                        }

                        // Thêm Variants
                        if (colorReq.Variants != null && colorReq.Variants.Count > 0)
                        {
                            foreach (var variantReq in colorReq.Variants)
                            {
                                // Xử lý Size
                                int sizeId;
                                if (variantReq.SizeId.HasValue && variantReq.SizeId > 0)
                                {
                                    // Dùng size có sẵn
                                    sizeId = variantReq.SizeId.Value;
                                }
                                else
                                {
                                    // Kiểm tra size đã tồn tại chưa
                                    var existingSize = await _sizeRepository.GetFirstOrDefaultAsync(
                                        x => x.SizeCode.Equals(variantReq.SizeCode, StringComparison.InvariantCultureIgnoreCase));

                                    if (existingSize != null)
                                    {
                                        sizeId = existingSize.SizeId;
                                    }
                                    else
                                    {
                                        // Tạo size mới
                                        var newSize = new Size
                                        {
                                            SizeCode = variantReq.SizeCode,
                                        };
                                        await _sizeRepository.InsertAsync(newSize);
                                        await _unitOfWork.SaveChanges(); // Save để lấy SizeId
                                        sizeId = newSize.SizeId;
                                    }
                                }

                                string productVariantId = string.IsNullOrEmpty(variantReq.ProductVariantId)
                                    ? $"{productColorId}-{sizeId}"
                                    : variantReq.ProductVariantId;

                                var imageUrl = variantReq.ImageUrl != null
                                    ? await _cloudinaryService.UploadImageAsync(variantReq.ImageUrl)
                                    : string.Empty;

                                var newVariant = new ProductVariant
                                {
                                    ProductVariantId = productVariantId,
                                    ProductColorId = productColorId,
                                    SizeId = sizeId,
                                    VariantName = variantReq.VariantName,
                                    Quantity = variantReq.Quantity,
                                    ImageUrl = imageUrl,
                                    Status = variantReq.Status ?? "Active",
                                    ProductWeight = variantReq.ProductWeight,
                                    ProductLength = variantReq.ProductLength,
                                    ProductWidth = variantReq.ProductWidth,
                                    ProductHeight = variantReq.ProductHeight
                                };

                                newProductColor.ProductVariants.Add(newVariant);
                            }
                        }

                        await _productColorRepository.InsertAsync(newProductColor);
                    }
                    else
                    {
                        // Update Color
                        dbColor.LensId = colorReq.LensId ?? dbColor.LensId;

                        if (colorReq.ColorId.HasValue && colorReq.ColorId > 0)
                        {
                            dbColor.ColorId = colorReq.ColorId.Value;
                        }

                        if (colorReq.NoBgImgUrl != null)
                        {
                            dbColor.NoBgImgUrl = await _cloudinaryService.UploadImageAsync(colorReq.NoBgImgUrl);
                        }

                        // Handle ProductImages update
                        if (colorReq.ProductVariantImages != null && colorReq.ProductVariantImages.Count > 0)
                        {
                            // Clear existing images and add new ones
                            dbColor.ProductImages.Clear();
                            var imageUrls = await _cloudinaryService.UploadMultipleImagesAsync(colorReq.ProductVariantImages);
                            foreach (var imageUrl in imageUrls)
                            {
                                dbColor.ProductImages.Add(new ProductImage
                                {
                                    ImageUrl = imageUrl
                                });
                            }
                        }

                        // ================== VARIANTS ==================
                        var dbVariants = dbColor.ProductVariants.ToList();
                        var reqVariantIds = colorReq.Variants
                            .Where(v => !string.IsNullOrEmpty(v.ProductVariantId))
                            .Select(v => v.ProductVariantId)
                            .ToList();

                        if (colorReq.Variants != null)
                        {
                            foreach (var variantReq in colorReq.Variants)
                            {
                                var dbVariant = dbVariants.FirstOrDefault(v => v.ProductVariantId == variantReq.ProductVariantId);

                                if (dbVariant == null)
                                {
                                    // Xử lý Size cho variant mới
                                    int sizeId;
                                    if (variantReq.SizeId.HasValue && variantReq.SizeId > 0)
                                    {
                                        sizeId = variantReq.SizeId.Value;
                                    }
                                    else
                                    {
                                        var existingSize = await _sizeRepository.GetFirstOrDefaultAsync(
                                            x => x.SizeCode.Equals(variantReq.SizeCode, StringComparison.InvariantCultureIgnoreCase));

                                        if (existingSize != null)
                                        {
                                            sizeId = existingSize.SizeId;
                                        }
                                        else
                                        {
                                            var newSize = new Size { SizeCode = variantReq.SizeCode };
                                            await _sizeRepository.InsertAsync(newSize);
                                            await _unitOfWork.SaveChanges();
                                            sizeId = newSize.SizeId;
                                        }
                                    }

                                    string productVariantId = string.IsNullOrEmpty(variantReq.ProductVariantId)
                                        ? $"{dbColor.ProductColorId}-{sizeId}"
                                        : variantReq.ProductVariantId;

                                    var imageUrl = variantReq.ImageUrl != null
                                        ? await _cloudinaryService.UploadImageAsync(variantReq.ImageUrl)
                                        : string.Empty;

                                    var newVariant = new ProductVariant
                                    {
                                        ProductVariantId = productVariantId,
                                        ProductColorId = dbColor.ProductColorId,
                                        SizeId = sizeId,
                                        VariantName = variantReq.VariantName,
                                        Quantity = variantReq.Quantity,
                                        Status = variantReq.Status ?? "Active",
                                        ProductWeight = variantReq.ProductWeight,
                                        ProductLength = variantReq.ProductLength,
                                        ProductWidth = variantReq.ProductWidth,
                                        ProductHeight = variantReq.ProductHeight,
                                        ImageUrl = imageUrl
                                    };

                                    dbColor.ProductVariants.Add(newVariant);
                                }
                                else
                                {
                                    // Update existing variant
                                    if (variantReq.SizeId.HasValue && variantReq.SizeId > 0)
                                    {
                                        dbVariant.SizeId = variantReq.SizeId.Value;
                                    }
                                    else if (!string.IsNullOrEmpty(variantReq.SizeCode))
                                    {
                                        var existingSize = await _sizeRepository.GetFirstOrDefaultAsync(
                                            x => x.SizeCode.Equals(variantReq.SizeCode, StringComparison.InvariantCultureIgnoreCase));

                                        if (existingSize != null)
                                        {
                                            dbVariant.SizeId = existingSize.SizeId;
                                        }
                                        else
                                        {
                                            var newSize = new Size { SizeCode = variantReq.SizeCode };
                                            await _sizeRepository.InsertAsync(newSize);
                                            await _unitOfWork.SaveChanges();
                                            dbVariant.SizeId = newSize.SizeId;
                                        }
                                    }

                                    dbVariant.VariantName = string.IsNullOrEmpty(variantReq.VariantName) ? dbVariant.VariantName : variantReq.VariantName;
                                    dbVariant.Quantity = variantReq.Quantity ?? dbVariant.Quantity;
                                    dbVariant.Status = variantReq.Status ?? dbVariant.Status;
                                    dbVariant.ProductWeight = variantReq.ProductWeight ?? dbVariant.ProductWeight;
                                    dbVariant.ProductLength = variantReq.ProductLength ?? dbVariant.ProductLength;
                                    dbVariant.ProductWidth = variantReq.ProductWidth ?? dbVariant.ProductWidth;
                                    dbVariant.ProductHeight = variantReq.ProductHeight ?? dbVariant.ProductHeight;

                                    if (variantReq.ImageUrl != null)
                                    {
                                        dbVariant.ImageUrl = await _cloudinaryService.UploadImageAsync(variantReq.ImageUrl);
                                    }
                                }
                            }
                        }

                        // Xóa variants không có trong request
                        var toRemoveVariants = dbVariants
                            .Where(v => !reqVariantIds.Contains(v.ProductVariantId))
                            .ToList();

                        if (toRemoveVariants.Any())
                        {
                            _productVariantRepository.DeleteRange(toRemoveVariants);
                        }
                    }
                }

                // ================== XÓA COLOR KHÔNG CÓ TRONG REQUEST ==================
                var toRemoveColors = dbColors
                    .Where(c => !requestColorIds.Contains(c.ProductColorId))
                    .ToList();

                if (toRemoveColors.Any())
                {
                    _productColorRepository.DeleteRange(toRemoveColors);
                }

                // Lưu thay đổi
                int result = await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();

                return new MessageModelWithData<Product>
                {
                    Message = "Cập nhật Product thành công",
                    StatusCode = StatusCodes.Status200OK,
                    Data = existingProduct
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new MessageModelWithData<Product>
                {
                    Message = $"Cập nhật thất bại: {ex.Message}",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        public async Task<MessageModel> DeleteProductAsync(string productId, bool hardDelete = false)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // Kiểm tra sản phẩm có tồn tại không
                var existingProduct = await _productRepository.GetByIdAsync(productId);
                if (existingProduct == null)
                {
                    return new MessageModel
                    {
                        Message = "Không tìm thấy sản phẩm",
                        StatusCode = StatusCodes.Status404NotFound
                    };
                }

                // Kiểm tra sản phẩm có đang trong sale campaign không
                var productInSaleCampaigns = await _productInSaleCampaignService.GetProductInSaleCampaign(productId);
                if (productInSaleCampaigns != null && productInSaleCampaigns.Any())
                {
                    return new MessageModel
                    {
                        Message = "Không thể xóa sản phẩm vì đang trong chiến dịch sale",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

                // Kiểm tra sản phẩm có trong đơn hàng nào không (nếu có bảng Order/OrderItem)
                // var hasOrders = await CheckProductInOrders(productId);
                // if (hasOrders && !hardDelete)
                // {
                //     return new MessageModel
                //     {
                //         Message = "Không thể xóa sản phẩm vì đã có đơn hàng. Sử dụng soft delete thay thế.",
                //         StatusCode = StatusCodes.Status400BadRequest
                //     };
                // }

                // SOFT DELETE - Product chỉ update IsDeleted = true, nhưng ProductColor và ProductVariant xóa hoàn toàn
                await SoftDeleteProduct(existingProduct);

                var result = await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();

                if (result > 0)
                {
                    return new MessageModel
                    {
                        Message = hardDelete ? "Xóa sản phẩm hoàn toàn thành công" : "Xóa sản phẩm thành công (đã xóa tất cả màu sắc và biến thể)",
                        StatusCode = StatusCodes.Status200OK
                    };
                }

                return new MessageModel
                {
                    Message = "Xóa sản phẩm thất bại",
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new MessageModel
                {
                    Message = $"Xóa sản phẩm thất bại: {ex.Message}",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        private async Task SoftDeleteProduct(Product product)
        {
            // Đánh dấu product là deleted (chỉ update IsDeleted)
            product.IsDeleted = true;

            // Lấy tất cả ProductColors với includes để xóa hoàn toàn
            var productColors = await _productColorRepository.GetAll(
                filter: x => x.ProductId == product.ProductId,
                includes: new Expression<Func<ProductColor, object>>[]
                        {
                            x => x.ProductVariants,
                            x => x.ProductImages
                        });

            foreach (var productColor in productColors)
            {
                // Xóa ProductVariants khỏi database
                if (productColor.ProductVariants?.Any() == true)
                {
                    _productVariantRepository.DeleteRange(productColor.ProductVariants);
                }

                // Xóa ProductImages khỏi database
                if (productColor.ProductImages?.Any() == true)
                {
                    _productImageRepository.DeleteRange(productColor.ProductImages);

                }

                // Xóa ảnh NoBg trên Cloudinary nếu cần
                if (!string.IsNullOrEmpty(productColor.NoBgImgUrl))
                {
                    // await _cloudinaryService.DeleteImageAsync(productColor.NoBgImgUrl);
                }
            }

            // Xóa tất cả ProductColors khỏi database
            if (productColors?.Any() == true)
            {
                _productColorRepository.DeleteRange(productColors);
            }
        }

        // Hàm kiểm tra sản phẩm có trong đơn hàng không (tùy chọn)
        private async Task<bool> CheckProductInOrders(string productId)
        {
            // Kiểm tra trong bảng OrderItems hoặc tương tự
            // var hasOrders = await _orderItemRepository.AnyAsync(x => x.ProductId == productId);
            // return hasOrders;

            // Tạm thời return false
            return false;
        }


    }
}
