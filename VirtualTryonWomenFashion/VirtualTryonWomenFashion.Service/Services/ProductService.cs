using AutoMapper;
using Azure;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.Color;
using VirtualTryonWomenFashion.Service.DTO.Order;
using VirtualTryonWomenFashion.Service.DTO.Product;
using VirtualTryonWomenFashion.Service.DTO.ProductColor;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;
using VirtualTryonWomenFashion.Service.DTO.UserInteraction;
using VirtualTryonWomenFashion.Service.Extensions;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.Helpers.CloudinaryConfig;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Mappers;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Model;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class ProductService : IProductService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProductRepository _productRepository;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IColorRepository _colorRepository;
        private readonly IProductColorRepository _productColorRepository;
        private readonly ISizeRepository _sizeRepository;
        private readonly IProductVariantRepository _productVariantRepository;
        private readonly IProductInSaleCampaignService _productInSaleCampaignService;
        private readonly IProductImageRepository _productImageRepository;
        private readonly IMapper _mapper;
        private readonly IVectorDbService _vectorDbService;
        private readonly IGeminiService _geminiService;
        private readonly ICategoryRepository _categoryRepository;
        private readonly ICurrentUserService _currentUserService;
        private readonly IWishlistRepository _wishlistRepository;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ITagRepository _tagRepository;
        private readonly IColorRecommendationSerivce _colorRecommendationSerivce;
        private readonly IUserInteractionService _userInteractionService;
        private readonly IRedisCacheService _redisCacheService;

        public ProductService(IUnitOfWork unitOfWork, IProductRepository productRepository,
            ICloudinaryService cloudinaryService,
            IColorRepository colorRepository,
            IProductColorRepository productColorRepository,
            ISizeRepository sizeRepository,
            IProductVariantRepository productVariantRepository,
            IProductInSaleCampaignService productInSaleCampaignService,
            IProductImageRepository productImageRepository,
            IMapper mapper,
            IVectorDbService vectorDbService,
            IGeminiService geminiService,
            ICategoryRepository categoryRepository,
            ICurrentUserService currentUserService,
            IWishlistRepository wishlistRepository,
            IHttpContextAccessor httpContextAccessor,
            ITagRepository tagRepository,
            IColorRecommendationSerivce colorRecommendationSerivce,
            IUserInteractionService userInteractionService,
            IRedisCacheService redisCacheService)
        {
            _unitOfWork = unitOfWork;
            _productRepository = productRepository;
            _cloudinaryService = cloudinaryService;
            _colorRepository = colorRepository;
            _productColorRepository = productColorRepository;
            _sizeRepository = sizeRepository;
            _productVariantRepository = productVariantRepository;
            _productInSaleCampaignService = productInSaleCampaignService;
            _productImageRepository = productImageRepository;
            _mapper = mapper;
            _vectorDbService = vectorDbService;
            _geminiService = geminiService;
            _categoryRepository = categoryRepository;
            _currentUserService = currentUserService;
            _wishlistRepository = wishlistRepository;
            _httpContextAccessor = httpContextAccessor;
            _tagRepository = tagRepository;
            _colorRecommendationSerivce = colorRecommendationSerivce;
            _userInteractionService = userInteractionService;
            _redisCacheService = redisCacheService;
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
                return result.ToUpper();
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

        public async Task<MessageModelWithData<Pagination<ResponseProductDto>>> GetAllProducts(
            PaginationParameter pagination,
            string? searchTerm,
            string? status,
            ProductSortEnum? sortBy,
            int? categoryId)
        {
            // ===== 1️⃣ Tạo bộ lọc =====
            Expression<Func<Product, bool>> filterExpression = p =>
                (string.IsNullOrEmpty(status) || status.ToLower() == "all" ||
                (status.ToLower() == "active" && p.IsDeleted == false) ||
                (status.ToLower() == "deleted" && p.IsDeleted == true))
                &&
                (string.IsNullOrEmpty(searchTerm) || p.ProductId.ToString().Contains(searchTerm.Trim()) || 
                 p.ProductName.ToLower().Contains(searchTerm.Trim().ToLower()) ||
                 (p.Description != null && p.Description.ToLower().Contains(searchTerm.Trim().ToLower())))
                &&
                (!categoryId.HasValue || p.CategoryId == categoryId);

            // ===== 2️⃣ Tổng số bản ghi =====
            int totalCount = await _productRepository.CountAsync(filterExpression);

            Func<IQueryable<Product>, IOrderedQueryable<Product>> orderBy = sortBy switch
            {
                ProductSortEnum.AZ => q => q.OrderBy(p => p.ProductName),
                ProductSortEnum.ZA => q => q.OrderByDescending(p => p.ProductName),
                ProductSortEnum.Newest => q => q.OrderByDescending(p => p.CreatedAt),
                ProductSortEnum.PriceAscending => q => q.OrderBy(p => p.Price),
                ProductSortEnum.PriceDescending => q => q.OrderByDescending(p => p.Price),
                _ => q => q.OrderByDescending(p => p.CreatedAt) // ProductSortType.Newest
            };
            
            // ===== 3️⃣ Truy vấn danh sách có includes =====
            var products = await _productRepository.GetAll(
                pagination: pagination,
                filter: filterExpression,
                includes: new Expression<Func<Product, object>>[]
                {
                    p => p.Category,
                    p => p.ProductColors,
                    p => p.ProductColors.Select(pc => pc.Color),
                    p => p.ProductColors.Select(pc => pc.ProductImages),
                    p => p.ProductColors.Select(pc => pc.ProductVariants)
                },
                orderBy: orderBy
            );

            // ===== 4️⃣ Map sang DTO =====
            var responseDtos = await Task.WhenAll(products.Select(p => MapToResponseProductDto(p)));

            // ===== 5️⃣ Trả về dữ liệu =====
            if (responseDtos.Any())
            {
                return new MessageModelWithData<Pagination<ResponseProductDto>>()
                {
                    Message = "Lấy danh sách sản phẩm thành công",
                    StatusCode = StatusCodes.Status200OK,
                    Data = new Pagination<ResponseProductDto>(
                        responseDtos.ToList(),
                        totalCount,
                        pagination.PageIndex,
                        pagination.PageSize
                    )
                };
            }

            return new MessageModelWithData<Pagination<ResponseProductDto>>()
            {
                Message = "Không tìm thấy sản phẩm nào thỏa mãn điều kiện",
                StatusCode = StatusCodes.Status200OK,
                Data = new Pagination<ResponseProductDto>(
                    new List<ResponseProductDto>(),
                    0,
                    pagination.PageIndex,
                    pagination.PageSize
                )
            };
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

        private async Task<ResponseProductWithListColorAndSizeDto> MapToResponseProductWithListColorAndSizeDto(Product product)
        {
            // Lấy giá trong campaign (nếu có)
            var productActiveInSaleCampaign =
                await _productInSaleCampaignService.GetPriceOfProductInActiveCampaign(product.ProductId);

            // Map entity -> DTO
            var dto = _mapper.Map<ResponseProductWithListColorAndSizeDto>(product);

            // Gán giá PriceAtTime tuỳ theo campaign
            dto.PriceAtTime = productActiveInSaleCampaign != null
                ? productActiveInSaleCampaign.SalePrice
                : product.Price;

            return dto;
        }

        public async Task<ResponseProductWithListColorAndSizeDto> GetProductBySlugAsync(string slug)
        {
            int? userId = null;

            // Lấy HttpContext và user id nếu có
            var httpContext = _httpContextAccessor.HttpContext;

            if (httpContext?.User?.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = httpContext.User.FindFirst("UserID")?.Value;
                if (int.TryParse(userIdClaim, out int parsedId))
                    userId = parsedId;
            }

            // Lấy sản phẩm theo slug
            var product = await _productRepository.GetProductBySlugAsync(slug);
            if (product == null)
                return null;

            // Map sang DTO + cập nhật giá từ campaign
            var dto = await MapToResponseProductWithListColorAndSizeDto(product);

            bool isInWishlist = false;
            // Nếu có user đăng nhập, kiểm tra wishlist
            if (userId.HasValue && userId.Value > 0)
            {
                isInWishlist = await _wishlistRepository
                    .IsProductInWishlistAsync(userId.Value, product.ProductId);
                
                await _userInteractionService.CreateAsync(new CreateUpdateUserInteractionDto()
                {
                    ProductId = product.ProductId,
                    InteractionType = UserInteractionEnum.View.ToString(),
                    Weight = 1.0m
                });
            }

            dto.IsInWishlist = isInWishlist;

            return dto;
        }

        public async Task<ResponseProductDto> GetProductByIdAsync(string productId)
        {
            var product = await _productRepository.GetProductByIdAsync(productId);
            if (product == null)
                return null;

            return await MapToResponseProductDto(product);
        }

        public async Task<ResponseProductDto> GetProductByVariantIdAsync(string variantId)
        {
            var product = await _productRepository.GetProductByVariantIdAsync(variantId);
            if (product == null)
                return null;
            return await MapToResponseProductDtoForVariant(product, variantId);
        }

        private async Task<ResponseProductDto> MapToResponseProductDtoForVariant(Product product, string variantId)
        {
            var productActiveInSaleCampaign = await _productInSaleCampaignService.GetPriceOfProductInActiveCampaign(product.ProductId);
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
            response.PriceAtTime = productActiveInSaleCampaign != null
                ? productActiveInSaleCampaign.SalePrice
                : product.Price;

            // Chỉ giữ lại đúng 1 ProductColor và 1 Variant
            response.ProductColors = new List<ResponseProductColorDto>
            {
                new ResponseProductColorDto
                {
                    ProductColorId = targetProductColor.ProductColorId,
                    ColorId = targetProductColor.ColorId,
                    LensId = targetProductColor.LensId,
                    PackageLens = targetProductColor.PackageLens,
                    Color = _mapper.Map<ResponseColorDto>(targetProductColor.Color),
                            ProductImagesDto = targetProductColor.ProductImages
                                .Select(pi => _mapper.Map<ResponseProductImageDto>(pi))
                                .ToList(),
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
                            SizeDto = _mapper.Map<ResponseSizeDto>(targetVariant.Size)
                        }
                    }
                }
            };

            return response;
        }

        public async Task<MessageModelWithData<Pagination<ResponseProductDto>>> SearchProductAsync(
            ProductSearchRequest request,
            PaginationParameter pagination)
        {
            int? userId = null;

            // Lấy HttpContext
            var httpContext = _httpContextAccessor.HttpContext;

            if (httpContext != null && httpContext.User.Identity != null && httpContext.User.Identity.IsAuthenticated)
            {
                var userIdClaim = httpContext.User.FindFirst("UserID")?.Value;
                if (int.TryParse(userIdClaim, out int parsedId))
                {
                    userId = parsedId;
                }
            }

            // Lấy danh sách product theo filter + sort
            var products = await _productRepository.SearchProductsWithIncludes(request.ProductName, request.CategoryName, request.ProductSort.ToString(), pagination);

            // Đếm tổng record (áp dụng filter nhưng bỏ phân trang)
            var totalRecords = await _productRepository.CountSearchProductsAsync(request.ProductName, request.CategoryName, request.ProductSort.ToString());
            var totalPages = (int)Math.Ceiling((double)totalRecords / pagination.PageSize);

            // Nếu user đã đăng nhập -> lấy danh sách Wishlist
            HashSet<string> userWishlistProductIds = new HashSet<string>();
            if (userId.HasValue && userId.Value > 0)
            {
                userWishlistProductIds = (await _wishlistRepository
                    .GetUserWishlistProductIdsAsync(userId.Value))
                    .ToHashSet();
            }

            // Map sang DTO
            //var productDtos = await Task.WhenAll(products.Select(p => MapToResponseProductDto(p)));
            var productDtos = products.Select(p =>
            {
                var dto = _mapper.Map<ResponseProductDto>(p);
                var productActiveInSaleCampaign = _productInSaleCampaignService.GetPriceOfProductInActiveCampaign(p.ProductId);
                dto.PriceAtTime = productActiveInSaleCampaign.Result != null
                    ? productActiveInSaleCampaign.Result.SalePrice
                    : dto.Price;
                dto.IsInWishlist = userId.HasValue && userWishlistProductIds.Contains(p.ProductId);
                return dto;
            }).ToList();

            return new MessageModelWithData<Pagination<ResponseProductDto>>()
            {
                Message = "Lấy danh sách sản phẩm thành công",
                StatusCode = StatusCodes.Status200OK,
                Data = new Pagination<ResponseProductDto>(
                    productDtos.ToList(),
                    totalRecords,
                    pagination.PageIndex,
                    pagination.PageSize
                )
            };
        }

        public async Task<MessageModelWithData<Product>> CreateProductAsync(CreateProductRequest request)
        {
            // 🔹 Kiểm tra trùng prefix trong danh sách màu gửi lên
            var duplicatePrefixes = request.ProductColor
                .GroupBy(c => c.ColorPrefix.ToLower()) // Gom theo prefix (không phân biệt hoa/thường)
                .Where(g => g.Count() > 1)             // Chỉ lấy nhóm có >1 phần tử
                .Select(g => g.Key)                    // Lấy prefix bị trùng
                .ToList();

            var duplicateNames = request.ProductColor
                .GroupBy(c => c.ColorName.ToLower()) 
                .Where(g => g.Count() > 1) 
                .Select(g => g.Key)                    
                .ToList();

            var duplicateHexCode = request.ProductColor
                .GroupBy(c => c.HexCode.ToLower()) 
                .Where(g => g.Count() > 1) 
                .Select(g => g.Key)        
                .ToList();

            if (duplicatePrefixes.Any() || duplicateNames.Any() || duplicateHexCode.Any())
            {
                var duplicatesStr = string.Join(", ", duplicatePrefixes);
                return new MessageModelWithData<Product>
                {
                    Message = $"Các màu có prefix bị trùng: {duplicatesStr}. Vui lòng kiểm tra lại.",
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }
            
            foreach (var colorReq in request.ProductColor)
            {
                // Nếu có LensId nhưng không có PackageLens -> Lỗi
                if (!string.IsNullOrEmpty(colorReq.LensId) && string.IsNullOrEmpty(colorReq.PackageLens))
                {
                    // Lấy tên/prefix để báo lỗi rõ ràng
                    string colorIdentifier = !string.IsNullOrEmpty(colorReq.ColorName) 
                        ? colorReq.ColorName 
                        : (!string.IsNullOrEmpty(colorReq.ColorPrefix) ? colorReq.ColorPrefix : "một màu");
            
                    return new MessageModelWithData<Product>
                    {
                        Message = $"Với màu '{colorIdentifier}', nếu bạn cung cấp LensId, bạn cũng phải cung cấp PackageLens.",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }
            }

            // 🔹 Danh sách để lưu URL ảnh đã upload (phục vụ rollback nếu lỗi)
            var uploadedImageUrls = new List<string>();

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                // 1️⃣ Tạo sản phẩm chính
                var product = await CreateProductEntityAsync(request, uploadedImageUrls);
                await _unitOfWork.SaveChanges(); // ⚠️ Save ngay để có ProductId

                // 2️⃣ Xử lý tags (tồn tại hoặc mới)
                await HandleProductTagsAsync(product, request);

                // 3️⃣ Xử lý màu sắc, hình ảnh, biến thể
                await HandleProductColorsAndVariantsAsync(product, request, uploadedImageUrls);

                // 4️⃣ Lưu tất cả thay đổi vào DB
                await _unitOfWork.SaveChanges();

                // 5️⃣ Tạo embedding & upsert vào Vector Database (song song)
                await CreateEmbeddingsForProductAsync(product);

                await _unitOfWork.CommitTransactionAsync();
                
                //var productDto = _mapper.Map<ResponseProductDto>(product);
                
                //await _redisCacheService.RemoveData(ProductCacheKey);
                await _redisCacheService.RemoveData("products:recommendation_data");
                return new MessageModelWithData<Product>
                {
                    Message = "Tạo sản phẩm thành công",
                    StatusCode = StatusCodes.Status201Created,
                    Data = product
                };
            }
            catch (InvalidOperationException ex)
            {
                await _unitOfWork.RollbackTransactionAsync();

                if (uploadedImageUrls.Any())
                {
                    try
                    {
                        await _cloudinaryService.DeleteMultipleImagesAsync(uploadedImageUrls);
                        Console.WriteLine($"Đã rollback {uploadedImageUrls.Count} ảnh trên Cloudinary.");
                    }
                    catch (Exception deleteEx)
                    {
                        Console.WriteLine($"Lỗi khi rollback ảnh: {deleteEx.Message}");
                    }
                }

                return new MessageModelWithData<Product>
                {
                    Message = ex.Message,
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();

                if (uploadedImageUrls.Any())
                {
                    try
                    {
                        await _cloudinaryService.DeleteMultipleImagesAsync(uploadedImageUrls);
                        Console.WriteLine($"Đã rollback {uploadedImageUrls.Count} ảnh trên Cloudinary.");
                    }
                    catch (Exception deleteEx)
                    {
                        Console.WriteLine($"Lỗi khi rollback ảnh: {deleteEx.Message}");
                    }
                }

                // Log chi tiết lỗi để debug
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }

                return new MessageModelWithData<Product>
                {
                    Message = $"Tạo thất bại: {ex.Message}",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        private async Task<Product> CreateProductEntityAsync(CreateProductRequest request, List<string> uploadedUrls)
        {
            var productImg = await _cloudinaryService.UploadImageAsync(request.MainImageUrl);
            uploadedUrls.Add( productImg );
            var product = new Product
            {
                ProductId = GenerateFixedLengthString(16),
                ProductName = request.ProductName,
                ProductSlug = await GenerateProductSlug(request.ProductName),
                Description = request.Description,
                MainImageUrl = productImg,
                CreatedAt = DateTime.UtcNow.AddHours(7),
                CategoryId = request.CategoryId,
                Price = request.Price,
            };

            await _productRepository.InsertAsync(product);
            return product;
        }

        private async Task HandleProductTagsAsync(Product product, CreateProductRequest request)
        {
            var tagsToAdd = new List<Tag>();

            // Tag cũ - Load tất cả một lần
            if (request.ExistingTagIds != null && request.ExistingTagIds.Any())
            {
                var existingTags = await _tagRepository.GetAllThenInclude(
                    filter: t => request.ExistingTagIds.Contains(t.TagId)
                );
                tagsToAdd.AddRange(existingTags);
            }

            // Tag mới - Batch query
            if (request.NewTags != null && request.NewTags.Any())
            {
                var normalizedNewTags = request.NewTags
                    .Select(t => t.Trim())
                    .Where(t => !string.IsNullOrEmpty(t))
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();

                var normalizedLowerTags = normalizedNewTags
                    .Select(t => t.ToLower())
                    .ToList();

                // Query tất cả tags có thể tồn tại một lần
                var existingTagsInDb = await _tagRepository.GetAllThenInclude(
                    filter: t => normalizedLowerTags.Contains(t.TagName.ToLower())
                );

                var existingTagsDict = existingTagsInDb
                    .ToDictionary(t => t.TagName.ToLower(), t => t);

                var newTagsToInsert = new List<Tag>();

                foreach (var tagName in normalizedNewTags)
                {
                    var normalizedLower = tagName.ToLower();

                    if (existingTagsDict.TryGetValue(normalizedLower, out var existingTag))
                    {
                        tagsToAdd.Add(existingTag);
                    }
                    else
                    {
                        var newTag = new Tag { TagName = tagName };
                        newTagsToInsert.Add(newTag);
                        tagsToAdd.Add(newTag);
                    }
                }

                // Insert tất cả tags mới cùng lúc
                if (newTagsToInsert.Any())
                {
                    await _tagRepository.AddRangeAsync(newTagsToInsert);
                    await _unitOfWork.SaveChanges(); // Để có TagId
                }
            }

            // Add tất cả tags vào product
            foreach (var tag in tagsToAdd)
            {
                product.Tags.Add(tag);
            }
        }

        private async Task HandleProductColorsAndVariantsAsync(Product product, CreateProductRequest request, List<string> uploadedUrls)
        {
            // ===== 1️⃣ Chuẩn bị dữ liệu (GIỮ NGUYÊN) =====
            // (Lấy IDs, prefixes, sizeIds... giống hệt mã gốc của bạn)
            var existingColorIds = request.ProductColor
                .Where(pc => pc.ColorId > 0)
                .Select(pc => pc.ColorId)
                .Distinct()
                .ToList();

            var prefixes = request.ProductColor
                .Where(pc => pc.ColorId <= 0 && !string.IsNullOrEmpty(pc.ColorPrefix))
                .Select(pc => pc.ColorPrefix.ToLower())
                .Distinct()
                .ToList();

            var names = request.ProductColor
                .Where(pc => pc.ColorId <= 0 && !string.IsNullOrEmpty(pc.ColorName))
                .Select(pc => pc.ColorName.ToLower())
                .Distinct()
                .ToList();

            var hexCodes = request.ProductColor
                .Where(pc => pc.ColorId <= 0 && !string.IsNullOrEmpty(pc.HexCode))
                .Select(pc => pc.HexCode.ToLower())
                .Distinct()
                .ToList();

            var sizeIds = request.ProductColor
                .SelectMany(pc => pc.Variants ?? Enumerable.Empty<CreateProductVariantRequest>())
                .Where(v => v.SizeId > 0)
                .Select(v => v.SizeId)
                .Distinct()
                .ToList();

            // ===== 2️⃣ Load dữ liệu từ DB (GIỮ NGUYÊN) =====
            // (Load tuần tự để tránh lỗi DbContext, đây là cách an toàn)
            var existingColors = existingColorIds.Count > 0
                ? await _colorRepository.GetAllThenInclude(filter: c => existingColorIds.Contains(c.ColorId))
                : new List<Color>();

            var potentialDuplicateColors = (prefixes.Count > 0 || names.Count > 0 || hexCodes.Count > 0)
                ? await _colorRepository.GetAllThenInclude(filter: c =>
                    prefixes.Contains(c.ColorPrefix.ToLower()) ||
                    names.Contains(c.ColorName.ToLower()) ||
                    hexCodes.Contains(c.HexCode.ToLower()))
                : new List<Color>();

            var sizes = sizeIds.Count > 0
                ? await _sizeRepository.GetAllThenInclude(filter: s => sizeIds.Contains(s.SizeId))
                : new List<Size>();

            // ===== 3️⃣ Chuẩn bị Dictionaries (GIỮ NGUYÊN) =====
            var dbColorsById = existingColors.ToDictionary(c => c.ColorId, c => c);
            var sizesDict = sizes.ToDictionary(s => s.SizeId, s => s);

            // Dùng TryAdd để tránh lỗi nếu có 2 màu trùng prefix (dữ liệu rác)
            var dbColorsByPrefix = new Dictionary<string, Color>();
            var dbColorsByName = new Dictionary<string, Color>();
            var dbColorsByHex = new Dictionary<string, Color>();
            foreach (var color in potentialDuplicateColors)
            {
                dbColorsByPrefix.TryAdd(color.ColorPrefix.ToLower(), color);
                dbColorsByName.TryAdd(color.ColorName.ToLower(), color);
                dbColorsByHex.TryAdd(color.HexCode.ToLower(), color);
            }

            // TẠO 3 DICTIONARIES ĐỂ THEO DÕI CÁC MÀU MỚI (trong request này)
            var newColorsByPrefix = new Dictionary<string, Color>();
            var newColorsByName = new Dictionary<string, Color>();
            var newColorsByHex = new Dictionary<string, Color>();

            // Các list tạm để batch insert
            var productColorsToInsert = new List<ProductColor>();
            var productImagesToInsert = new List<ProductImage>();
            var productVariantsToInsert = new List<ProductVariant>();

            // ===== 4️⃣ TỐI ƯU 1: Giai đoạn UPLOAD (Tạo Task) =====
            // Tạo tất cả các "job" upload
            var uploadJobs = request.ProductColor
                .Select(colorRequest => new ColorUploadJob(colorRequest, _cloudinaryService))
                .ToList();

            // Lấy TẤT CẢ các task từ tất cả các job
            var allUploadTasks = uploadJobs.SelectMany(job => job.GetAllTasks()).ToList();

            // Chạy TẤT CẢ các tác vụ upload song song VÀ CHỈ AWAIT MỘT LẦN
            await Task.WhenAll(allUploadTasks);

            // Thu thập kết quả (đã hoàn thành, không cần await nữa)
            // Dùng vòng lặp for thay vì ForEach async để an toàn
            foreach (var job in uploadJobs)
            {
                await job.MaterializeResultsAsync(uploadedUrls);
            }

            // ===== 5️⃣ TỐI ƯU 2: Giai đoạn XỬ LÝ (CPU-bound, không await) =====
            // Bây giờ vòng lặp này chạy cực nhanh vì không còn I/O
            foreach (var job in uploadJobs)
            {
                var colorRequest = job.Request;

                // Kiểm tra trùng size (GIỮ NGUYÊN LOGIC)
                if (colorRequest.Variants != null && colorRequest.Variants.Count > 0)
                {
                    var duplicateSizeIds = colorRequest.Variants
                        .GroupBy(v => v.SizeId)
                        .Where(g => g.Count() > 1)
                        .Select(g => g.Key)
                        .ToList();

                    if (duplicateSizeIds.Any())
                    {
                        var duplicateStr = string.Join(", ", duplicateSizeIds);
                        throw new InvalidOperationException(
                            $"Trong màu '{colorRequest.ColorPrefix}', có các SizeId bị trùng: {duplicateStr}. Vui lòng kiểm tra lại."
                        );
                    }
                }

                // Dùng helper mới, trả về Color Entity
                Color colorEntity = GetOrCreateColor(
                                        colorRequest,
                                        dbColorsById,
                                        dbColorsByPrefix,
                                        dbColorsByName,
                                        dbColorsByHex,
                                        newColorsByPrefix,
                                        newColorsByName,
                                        newColorsByHex
                                    );
                string colorPrefix = colorEntity.ColorPrefix; // Lấy prefix từ entity
                var productColorId = $"{product.ProductId}-{colorPrefix}";

                // Tạo ProductColor entity
                var productColor = new ProductColor
                {
                    ProductColorId = productColorId,
                    ProductId = product.ProductId,
                    NoBgImgUrl = job.NoBgUrl, // Lấy kết quả đã có
                    LensId = colorRequest.LensId,
                    PackageLens = colorRequest.PackageLens,
                    // Gán thẳng Entity, không gán Id
                    Color = colorEntity
                };
                productColorsToInsert.Add(productColor);

                // Thêm ảnh biến thể nếu có
                if (job.VariantImageUrls.Count > 0)
                {
                    productImagesToInsert.AddRange(
                        job.VariantImageUrls.Select(url => new ProductImage
                        {
                            ProductColorId = productColorId,
                            ImageUrl = url
                        })
                    );
                }

                // ===== Tạo ProductVariant (không còn await bên trong) =====
                if (colorRequest.Variants?.Count > 0)
                {
                    foreach (var v in colorRequest.Variants)
                    {
                        if (!sizesDict.TryGetValue(v.SizeId, out var size))
                            continue;

                        productVariantsToInsert.Add(new ProductVariant
                        {
                            ProductVariantId = $"{productColorId}-{size.SizeCode}",
                            ProductColorId = productColorId,
                            SizeId = v.SizeId,
                            VariantName = v.VariantName,
                            Quantity = v.Quantity,
                            ClothesLength = v.ClothesLength,
                            ImageUrl = job.VariantImageUrlsDict[v], // Lấy kết quả đã có
                            Status = "Active",
                            ProductWeight = v.ProductWeight,
                            ProductLength = v.ProductLength,
                            ProductWidth = v.ProductWidth,
                            ProductHeight = v.ProductHeight
                        });
                    }
                }
            }

            if (productColorsToInsert.Count > 0)
                await _productColorRepository.AddRangeAsync(productColorsToInsert);

            if (productImagesToInsert.Count > 0)
                await _productImageRepository.AddRangeAsync(productImagesToInsert);

            if (productVariantsToInsert.Count > 0)
                await _productVariantRepository.AddRangeAsync(productVariantsToInsert);

            await _unitOfWork.SaveChanges();
        }

        private Color GetOrCreateColor(
            CreateProductColorRequest request,
            // Dictionaries cho màu từ DB
            Dictionary<int, Color> dbColorsById,
            Dictionary<string, Color> dbColorsByPrefix,
            Dictionary<string, Color> dbColorsByName,
            Dictionary<string, Color> dbColorsByHex,
            // Dictionaries cho màu MỚI (trong request này)
            Dictionary<string, Color> newColorsByPrefix,
            Dictionary<string, Color> newColorsByName,
            Dictionary<string, Color> newColorsByHex)
        {
            // 1. Kiểm tra bằng ID (Ưu tiên cao nhất)
            if (request.ColorId > 0 && dbColorsById.TryGetValue(request.ColorId, out var existingColor))
            {
                return existingColor;
            }

            // Chuẩn bị các keys (viết thường)
            var prefixLower = request.ColorPrefix.ToLower();
            var nameLower = request.ColorName.ToLower();
            var hexLower = request.HexCode.ToLower();

            // 2. Kiểm tra trùng lặp trong DB (đã load trước)
            if (dbColorsByPrefix.TryGetValue(prefixLower, out var colorByPrefix))
            {
                return colorByPrefix; // Trùng Prefix
            }
            if (dbColorsByName.TryGetValue(nameLower, out var colorByName))
            {
                return colorByName; // Trùng Tên
            }
            if (dbColorsByHex.TryGetValue(hexLower, out var colorByHex))
            {
                return colorByHex; // Trùng HexCode
            }

            // 3. Kiểm tra trùng lặp trong các màu MỚI VỪA TẠO (trong request này)
            //    (Đây là bước chống race-condition trong CÙNG 1 request)
            if (newColorsByPrefix.TryGetValue(prefixLower, out var newColorByPrefix))
            {
                return newColorByPrefix;
            }
            if (newColorsByName.TryGetValue(nameLower, out var newColorByName))
            {
                return newColorByName;
            }
            if (newColorsByHex.TryGetValue(hexLower, out var newColorByHex))
            {
                return newColorByHex;
            }

            // 4. Không trùng lặp -> Tạo thực thể MỚI (chưa lưu vào DB)
            var newColor = new Color
            {
                ColorName = request.ColorName,
                ColorPrefix = request.ColorPrefix.ToUpper(),
                HexCode = request.HexCode.ToUpper()
                // Gán các giá trị mặc định nếu cần (ví dụ: Status = "Active")
            };

            // Thêm màu mới này vào cả 3 Dictionaries theo dõi
            newColorsByPrefix[prefixLower] = newColor;
            newColorsByName[nameLower] = newColor;
            newColorsByHex[hexLower] = newColor;

            return newColor;
        }

        private async Task CreateEmbeddingsForProductAsync(Product product)
        {
            var productWithRelations = await _productRepository.GetProductByIdAsync(product.ProductId);
            var productTags = await _tagRepository.GetTagsByProductIdAsync(product.ProductId);
            var category = await _categoryRepository.GetByIdAsync(product.CategoryId.Value);

            string tagsText = productTags != null && productTags.Any()
                ? string.Join(", ", productTags.Select(t => t.TagName))
                : "Không có thẻ gắn";

            // Tạo tất cả embeddings và upsert song song
            var embeddingTasks = new List<Task>();

            foreach (var productColor in productWithRelations.ProductColors)
            {
                foreach (var variant in productColor.ProductVariants)
                {
                    // Capture variables để tránh closure issue
                    var colorCopy = productColor;
                    var variantCopy = variant;

                    embeddingTasks.Add(Task.Run(async () =>
                    {
                        var textParts = new List<string>
                        {
                            $"Tên sản phẩm: {product.ProductName}",
                            $"Mô tả: {product.Description}",
                            $"Danh mục: {category.CategoryName}",
                            $"Có thể mặc: {category.BodyPart}",
                            $"Tag: {tagsText}",
                            $"Màu sắc: {colorCopy.Color?.ColorName ?? "Không rõ"}",
                            $"Mã màu: {colorCopy.Color?.ColorPrefix ?? ""} ({colorCopy.Color?.HexCode ?? ""})",
                            $"Size: {variantCopy.Size?.SizeCode ?? "Free size"}",
                            $"Giá: {product.Price} VND"
                        };

                        string textToEmbed = string.Join(". ", textParts);
                        float[] vector = await _geminiService.GetEmbeddingAsync(textToEmbed);

                        var metadata = new Dictionary<string, string>
                        {
                            { "productId", product.ProductId },
                            { "productName", product.ProductName },
                            { "productSlug", product.ProductSlug },
                            { "categoryId", category.CategoryId.ToString() },
                            { "categoryName", category.CategoryName },
                            { "itemType", category.CategoryName },
                            { "bodyPart", category.BodyPart },
                            { "tags", tagsText ?? "" },
                            { "productColorId", colorCopy.ProductColorId },
                            { "colorId", colorCopy.ColorId?.ToString() ?? "" },
                            { "colorName", colorCopy.Color?.ColorName ?? "" },
                            { "colorPrefix", colorCopy.Color?.ColorPrefix ?? "" },
                            { "hexCode", colorCopy.Color?.HexCode ?? "" },
                            { "productVariantId", variantCopy.ProductVariantId },
                            { "variantName", variantCopy.VariantName },
                            { "sizeId", variantCopy.SizeId?.ToString() ?? "" },
                            { "sizeCode", variantCopy.Size?.SizeCode ?? "" },
                            { "price", product.Price?.ToString() ?? "" },
                            { "imageUrl", variantCopy.ImageUrl ?? "" },
                            { "noBgImageUrl", colorCopy.NoBgImgUrl ?? "" },
                            { "createdAt", product.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss") }
                        };

                        await _vectorDbService.UpsertAsync(variantCopy.ProductVariantId, vector, metadata);
                    }));
                }
            }

            await Task.WhenAll(embeddingTasks);
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
                        if (variant.SizeId <= 0)
                            return (false, "Thông tin size không đầy đủ");

                        if (variant.Quantity < 0 || variant.ClothesLength <= 0 || variant.ProductWidth <= 0 
                            || variant.ProductLength <= 0 || variant.ProductWeight <= 0 || variant.ProductHeight <= 0)
                            return (false, "Số lượng, độ dài đồ, dài gói, nặng gói, rộng gói, cao gói không được âm");
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
                var product = await _productRepository.GetByIdAsync(productId);
                if (product == null)
                    return new MessageModelWithData<Product>
                    {
                        Message = $"Không tìm thấy Product",
                        StatusCode = StatusCodes.Status404NotFound
                    };

                await UpdateProductFieldsAsync(product, request);

                await UpdateProductTagsAsync(product, request.Tags);

                var dbColors = await _productColorRepository.GetAll(
                    filter: x => x.ProductId == productId,
                    includes: x => x.ProductVariants);

                if (request.ProductColor != null && request.ProductColor.Any())
                {
                    await UpdateProductColorsAsync(product, request.ProductColor, dbColors);
                }

                int result = await _unitOfWork.SaveChanges();
                
                // Sau khi cập nhật DB thành công
                var updatedProduct = await _productRepository.GetProductByIdAsync(productId);

                // Gọi hàm cập nhật embedding
                await UpdateProductEmbeddingsAsync(updatedProduct);
                
                await _unitOfWork.CommitTransactionAsync();
                await _redisCacheService.RemoveData("products:recommendation_data");
                
                //var productDto = _mapper.Map<ResponseProductDto>(updatedProduct);
                return new MessageModelWithData<Product>
                {
                    Message = "Cập nhật sản phẩm thành công",
                    StatusCode = StatusCodes.Status200OK,
                    Data = updatedProduct
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

        private async Task UpdateProductFieldsAsync(Product product, UpdateProductRequest request)
        {
            product.ProductName = request.ProductName ?? product.ProductName;
            product.Description = request.Description ?? product.Description;
            product.CategoryId = request.CategoryId ?? product.CategoryId;
            if (request.ProductName != null)
            {
                product.ProductSlug = await GenerateProductSlug(request.ProductName, product.ProductId);
            }

            if (request.MainImageUrl != null)
                product.MainImageUrl = await _cloudinaryService.UploadImageAsync(request.MainImageUrl);

            if (request.Price.HasValue && request.Price != product.Price)
            {
                var productInSale = await _productInSaleCampaignService.GetProductInSaleCampaign(product.ProductId);
                if (productInSale.Any())
                    throw new InvalidOperationException("Không thể cập nhật giá sản phẩm vì đang trong chiến dịch sale.");

                product.Price = request.Price.Value;
            }
        }

        private async Task UpdateProductTagsAsync(Product product, List<TagDto> tags)
        {
            if (tags == null) return;

            if (!tags.Any()) return;

            var currentTags = await _tagRepository.GetTagsByProductIdAsync(product.ProductId);
            var currentTagIds = currentTags.Select(t => t.TagId).ToList();

            var requestTagIds = tags.Where(t => t.TagId.HasValue)
                                    .Select(t => t.TagId.Value)
                                    .ToList();
            var requestTagNames = tags.Where(t => !t.TagId.HasValue && !string.IsNullOrWhiteSpace(t.TagName))
                                      .Select(t => t.TagName.Trim())
                                      .ToList();

            var newTagsToAdd = new List<Tag>();

            foreach (var tagId in requestTagIds)
            {
                if (!currentTagIds.Contains(tagId))
                {
                    var existingTag = await _tagRepository.GetByIdAsync(tagId);
                    if (existingTag != null)
                        newTagsToAdd.Add(existingTag);
                }
            }

            foreach (var tagName in requestTagNames)
            {
                var normalized = tagName.ToLower();
                var existingTag = await _tagRepository.GetFirstOrDefaultAsync(t => t.TagName.ToLower() == normalized);
                if (existingTag != null)
                {
                    if (!currentTagIds.Contains(existingTag.TagId))
                        newTagsToAdd.Add(existingTag);
                }
                else
                {
                    var newTag = new Tag { TagName = tagName };
                    await _tagRepository.InsertAsync(newTag);
                    await _unitOfWork.SaveChanges();
                    newTagsToAdd.Add(newTag);
                }
            }

            var normalizedRequestTagNames = requestTagNames.Select(n => n.ToLower()).ToList();

            var tagsToRemove = currentTags.Where(ct =>
                                !requestTagIds.Contains(ct.TagId) &&
                                !normalizedRequestTagNames.Contains(ct.TagName.ToLower()))
                                            .ToList();
            if (tagsToRemove.Any())
            {
                foreach (var t in tagsToRemove)
                {
                    product.Tags.Remove(t);
                }
            }

            foreach (var t in newTagsToAdd)
            {
                product.Tags.Add(t);
            }
        }

        public async Task UpdateProductColorsAsync(Product product, List<UpdateProductColorDto> requestColors, IEnumerable<ProductColor> dbColors)
        {
            if (requestColors == null || !requestColors.Any()) // Nếu request trống thì không xóa, chỉ bỏ qua
                return; // Không đụng đến dữ liệu cũ
            
            // 🔽 BỔ SUNG: LOGIC VALIDATION
            var dbColorsDict = dbColors.ToDictionary(c => c.ProductColorId, c => c);
            foreach (var colorReq in requestColors)
            {
                string finalLensId;
                string finalPackageLens;

                // Kiểm tra xem đây là update hay add new
                if (!string.IsNullOrEmpty(colorReq.ProductColorId) && dbColorsDict.TryGetValue(colorReq.ProductColorId, out var existingColor))
                {
                    // Đây là UPDATE. Lấy giá trị final
                    // Nếu request là null, giữ giá trị cũ (existing).
                    // Nếu request không null (kể cả ""), lấy giá trị request.
                    finalLensId = colorReq.LensId ?? existingColor.LensId;
                    finalPackageLens = colorReq.PackageLens ?? existingColor.PackageLens;
                }
                else
                {
                    // Đây là ADD NEW. Lấy thẳng từ request
                    finalLensId = colorReq.LensId;
                    finalPackageLens = colorReq.PackageLens;
                }

                // Chạy logic kiểm tra
                if (!string.IsNullOrEmpty(finalLensId) && string.IsNullOrEmpty(finalPackageLens))
                {
                    // Lấy tên/prefix để báo lỗi rõ ràng
                    string colorIdentifier = !string.IsNullOrEmpty(colorReq.ColorName)
                        ? colorReq.ColorName
                        : (!string.IsNullOrEmpty(colorReq.ColorPrefix) ? colorReq.ColorPrefix : $"ID {colorReq.ProductColorId ?? "mới"}");

                    // Ném Exception để transaction tự động rollback
                    throw new InvalidOperationException($"Với màu '{colorIdentifier}', nếu bạn cung cấp LensId, bạn cũng phải cung cấp PackageLens.");
                }
            }

            var requestColorIds = requestColors.Where(c => !string.IsNullOrEmpty(c.ProductColorId))
                                               .Select(c => c.ProductColorId).ToList();

            foreach (var colorReq in requestColors)
            {
                var existingColor = dbColors.FirstOrDefault(c => c.ProductColorId == colorReq.ProductColorId);

                if (existingColor == null)
                    await AddNewProductColorAsync(product, colorReq);
                else
                    await UpdateExistingProductColorAsync(existingColor, colorReq);
            }

            // Xóa color không còn trong request
            var toRemove = dbColors.Where(c => !requestColorIds.Contains(c.ProductColorId)).ToList();
            if (toRemove.Any())
            {
                foreach (var color in toRemove)
                {
                    // Xóa ảnh con
                    if (color.ProductImages.Any())
                        _productImageRepository.DeleteRange(color.ProductImages);

                    // Xóa variants con
                    if (color.ProductVariants.Any())
                        _productVariantRepository.DeleteRange(color.ProductVariants);
                }

                _productColorRepository.DeleteRange(toRemove);
            }
        }

        private async Task AddNewProductColorAsync(Product product, UpdateProductColorDto colorReq)
        {
            var colorEntity = await GetOrCreateColorAsync(colorReq);
            var colorPrefix = colorEntity.ColorPrefix;

            var productColorId = string.IsNullOrEmpty(colorReq.ProductColorId)
                ? $"{product.ProductId}-{colorPrefix}"
                : colorReq.ProductColorId;

            var noBgUrl = colorReq.NoBgImgUrl != null
                ? await _cloudinaryService.UploadImageAsync(colorReq.NoBgImgUrl)
                : string.Empty;

            var newColor = new ProductColor
            {
                ProductColorId = productColorId,
                ProductId = product.ProductId,
                Color = colorEntity,
                NoBgImgUrl = noBgUrl,
                LensId = colorReq.LensId,
                PackageLens = colorReq.PackageLens
            };

            // Upload multiple images
            if (colorReq.ProductVariantImages?.Any() == true)
            {
                var urls = await _cloudinaryService.UploadMultipleImagesAsync(colorReq.ProductVariantImages);
                newColor.ProductImages = urls.Select(url => new ProductImage
                {
                    ProductColorId = productColorId,
                    ImageUrl = url
                }).ToList();
            }

            await UpdateOrAddVariantsAsync(newColor, colorReq.Variants);
            await _productColorRepository.InsertAsync(newColor);
        }

        private async Task UpdateExistingProductColorAsync(ProductColor existingColor, UpdateProductColorDto colorReq)
        {
            if (colorReq.NoBgImgUrl != null)
                existingColor.NoBgImgUrl = await _cloudinaryService.UploadImageAsync(colorReq.NoBgImgUrl);

            if (colorReq.LensId != null)
                existingColor.LensId = colorReq.LensId;
            
            if (colorReq.PackageLens != null)
                existingColor.PackageLens = colorReq.PackageLens;

            // Replace images
            if (colorReq.ProductVariantImages?.Any() == true)
            {
                // CHỈ THỊ XÓA CÁC ĐỐI TƯỢNG CŨ TỪ DATABASE
                if (existingColor.ProductImages.Any())
                {
                    // Sử dụng Repository để đánh dấu các đối tượng cũ là Deleted
                    _productImageRepository.DeleteRange(existingColor.ProductImages);
                }

                existingColor.ProductImages.Clear();
                var urls = await _cloudinaryService.UploadMultipleImagesAsync(colorReq.ProductVariantImages);
                existingColor.ProductImages = urls.Select(u => new ProductImage
                {
                    ProductColorId = existingColor.ProductColorId,
                    ImageUrl = u
                }).ToList();
            }

            await UpdateOrAddVariantsAsync(existingColor, colorReq.Variants);
        }

        public async Task UpdateOrAddVariantsAsync(ProductColor color, List<UpdateProductVariantRequest>? variants)
        {
            if (variants == null) return;

            if (!variants.Any())
                return;

            var dbVariants = (await _productVariantRepository
                                            .GetAll(filter: v => v.ProductColorId == color.ProductColorId)).ToList();
            var reqIds = variants.Where(v => !string.IsNullOrEmpty(v.ProductVariantId))
                                 .Select(v => v.ProductVariantId).ToList();

            foreach (var vReq in variants)
            {
                var dbVariant = dbVariants.FirstOrDefault(v => v.ProductVariantId == vReq.ProductVariantId);

                if (dbVariant == null)
                {
                    var sizeEntity = await GetOrCreateSizeAsync(vReq);
                    var sizeCode = sizeEntity.SizeCode;

                    var imageUrl = await _cloudinaryService.UploadImageAsync(vReq.ImageUrl);
                    color.ProductVariants.Add(new ProductVariant
                    {
                        ProductVariantId = $"{color.ProductColorId}-{sizeCode}",
                        ProductColorId = color.ProductColorId,
                        Size = sizeEntity,
                        VariantName = vReq.VariantName,
                        Quantity = vReq.Quantity,
                        ClothesLength = vReq.ClothesLength,
                        ImageUrl = imageUrl,
                        Status = vReq.Status ?? "Active",
                        ProductWeight = vReq.ProductWeight,
                        ProductLength = vReq.ProductLength,
                        ProductWidth = vReq.ProductWidth,
                        ProductHeight = vReq.ProductHeight
                    });
                }
                else
                {
                    await UpdateExistingVariantAsync(dbVariant, vReq);
                }
            }

            // Xóa variant không có trong request
            var toRemove = dbVariants.Where(v => !reqIds.Contains(v.ProductVariantId)).ToList();
            if (toRemove.Any())
                _productVariantRepository.DeleteRange(toRemove);
        }

        private async Task UpdateExistingVariantAsync(ProductVariant dbVariant, UpdateProductVariantRequest req)
        {
            if (req.ImageUrl != null)
                dbVariant.ImageUrl = await _cloudinaryService.UploadImageAsync(req.ImageUrl);

            dbVariant.Quantity = req.Quantity ?? dbVariant.Quantity;
            dbVariant.ClothesLength = req.ClothesLength ?? dbVariant.ClothesLength;
            dbVariant.Status = req.Status ?? dbVariant.Status;
            dbVariant.VariantName = req.VariantName ?? dbVariant.VariantName;
            dbVariant.ProductWeight = req.ProductWeight ?? dbVariant.ProductWeight;
            dbVariant.ProductLength = req.ProductLength ?? dbVariant.ProductLength;
            dbVariant.ProductWidth = req.ProductWidth ?? dbVariant.ProductWidth;
            dbVariant.ProductHeight = req.ProductHeight ?? dbVariant.ProductHeight;
        }

        public async Task<Color> GetOrCreateColorAsync(UpdateProductColorDto colorReq)
        {
            if (colorReq.ColorId.HasValue && colorReq.ColorId > 0)
            {
                return await _colorRepository.GetByIdAsync(colorReq.ColorId.Value);
            }

            var existing = await _colorRepository.GetFirstOrDefaultAsync(
                x => x.ColorPrefix.ToLower() == colorReq.ColorPrefix.ToLower());

            if (existing != null)
                return existing;

            var newColor = new Color
            {
                ColorPrefix = colorReq.ColorPrefix,
                HexCode = colorReq.HexCode,
                ColorName = colorReq.ColorName
            };
            await _colorRepository.InsertAsync(newColor);
            return newColor;
        }

        public async Task<Size> GetOrCreateSizeAsync(UpdateProductVariantRequest vReq)
        {
            Size size = new Size();
            if (vReq.SizeId.HasValue && vReq.SizeId > 0)
            {
                size = await _sizeRepository.GetByIdAsync(vReq.SizeId.Value);
            }

            return size;
        }

        private async Task UpdateProductEmbeddingsAsync(Product product)
        {
            var category = await _categoryRepository.GetByIdAsync(product.CategoryId.Value);
            var productTags = await _tagRepository.GetTagsByProductIdAsync(product.ProductId);

            string tagsText = productTags != null && productTags.Any()
                ? string.Join(", ", productTags.Select(t => t.TagName))
                : "Không có thẻ gắn";

            var embeddingTasks = new List<Task>();

            foreach (var productColor in product.ProductColors)
            {
                foreach (var variant in productColor.ProductVariants)
                {
                    var colorCopy = productColor;
                    var variantCopy = variant;
                    embeddingTasks.Add(Task.Run(async () =>
                    {
                        var textParts = new List<string>
                        {
                            $"Tên sản phẩm: {product.ProductName}",
                            $"Mô tả: {product.Description}",
                            $"Danh mục: {category.CategoryName}",
                            $"Có thể mặc: {category.BodyPart}",
                            $"Tag: {tagsText}",
                            $"Màu sắc: {productColor.Color?.ColorName ?? "Không rõ"}",
                            $"Mã màu: {productColor.Color?.ColorPrefix ?? ""} ({productColor.Color?.HexCode ?? ""})",
                            $"Size: {variant.Size?.SizeCode ?? "Free size"}",
                            $"Giá: {product.Price} VND"
                        };

                            string textToEmbed = string.Join(". ", textParts);
                            float[] vector = await _geminiService.GetEmbeddingAsync(textToEmbed);

                            var metadata = new Dictionary<string, string>
                        {
                            { "productId", product.ProductId },
                            { "productName", product.ProductName },
                            { "productSlug", product.ProductSlug },
                            { "categoryId", category.CategoryId.ToString() },
                            { "categoryName", category.CategoryName },
                            { "itemType", category.CategoryName },
                            { "bodyPart", category.BodyPart },
                            { "tags", tagsText ?? "" },
                            { "productColorId", productColor.ProductColorId },
                            { "colorId", productColor.ColorId?.ToString() ?? "" },
                            { "colorName", productColor.Color?.ColorName ?? "" },
                            { "colorPrefix", productColor.Color?.ColorPrefix ?? "" },
                            { "hexCode", productColor.Color?.HexCode ?? "" },
                            { "productVariantId", variant.ProductVariantId },
                            { "variantName", variant.VariantName },
                            { "sizeId", variant.SizeId?.ToString() ?? "" },
                            { "sizeCode", variant.Size?.SizeCode ?? "" },
                            { "price", product.Price?.ToString() ?? "" },
                            { "imageUrl", variant.ImageUrl ?? "" },
                            { "noBgImageUrl", productColor.NoBgImgUrl ?? "" },
                            { "createdAt", product.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss") }
                        };

                        // Upsert vector (cập nhật nếu đã có, thêm nếu chưa)
                        await _vectorDbService.UpsertAsync(variant.ProductVariantId, vector, metadata);
                    }));
                }
            }
            await Task.WhenAll(embeddingTasks);
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

                // SOFT DELETE - Product chỉ update IsDeleted = true, nhưng ProductColor và ProductVariant xóa hoàn toàn
                await SoftDeleteProduct(existingProduct);

                var result = await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();
                await _redisCacheService.RemoveData("products:recommendation_data");

                if (result > 0)
                {
                    return new MessageModel
                    {
                        Message = hardDelete ? "Xóa sản phẩm hoàn toàn thành công" : "Xóa sản phẩm thành công (đã xóa tất cả màu sắc và biến thể)",
                        StatusCode = StatusCodes.Status204NoContent
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

            // Lấy tất cả ID variant để xóa khỏi Pinecone
            var variantIds = productColors
                .SelectMany(c => c.ProductVariants ?? new List<ProductVariant>())
                .Select(v => v.ProductVariantId)
                .ToList();

            // Nếu có variant → xóa vector trong Pinecone
            if (variantIds.Any())
            {
                await _vectorDbService.DeleteAsync(filter: new Dictionary<string, object>
                {
                    { "productVariantId", product.ProductId }
                });
            }

            var imageUrlsToDelete = new List<string>();

            foreach (var productColor in productColors)
            {
                // Gom ảnh từ ProductImages
                if (productColor.ProductImages?.Any() == true)
                {
                    imageUrlsToDelete.AddRange(productColor.ProductImages
                        .Where(img => !string.IsNullOrEmpty(img.ImageUrl))
                        .Select(img => img.ImageUrl));
                }

                // Gom ảnh NoBg
                if (!string.IsNullOrEmpty(productColor.NoBgImgUrl))
                {
                    imageUrlsToDelete.Add(productColor.NoBgImgUrl);
                }

                // Xóa ProductVariants khỏi database
                if (productColor.ProductVariants?.Any() == true)
                {
                    var variantImageUrls = productColor.ProductVariants
                        .Where(v => !string.IsNullOrEmpty(v.ImageUrl))
                        .Select(v => v.ImageUrl)
                        .ToList();

                    if (variantImageUrls.Any())
                        imageUrlsToDelete.AddRange(variantImageUrls);
                    _productVariantRepository.DeleteRange(productColor.ProductVariants);
                }

                // Xóa ProductImages khỏi database
                if (productColor.ProductImages?.Any() == true)
                {
                    _productImageRepository.DeleteRange(productColor.ProductImages);

                }
            }

            // ==== ☁️ Xóa ảnh trên Cloudinary (song song) ====
            if (imageUrlsToDelete.Any())
            {
                try
                {
                    await _cloudinaryService.DeleteMultipleImagesAsync(imageUrlsToDelete);
                }
                catch (Exception ex)
                {
                    // Ghi log nhưng không rollback transaction (vì ảnh là ngoại vi)
                    Console.WriteLine($"[Cloudinary] Lỗi khi xóa ảnh: {ex.Message}");
                }
            }

            // Xóa tất cả ProductColors khỏi database
            if (productColors?.Any() == true)
            {
                _productColorRepository.DeleteRange(productColors);
            }
        }

        public async Task<ResponseProductDto> GetProductByProductColorIdAsyncForTryOn(string productColorId)
        {
            var product = await _productRepository.GetProductByProductColorIdAsync(productColorId);
            if (product == null)
                return null;
            foreach (var pc in product.ProductColors)
            {
                pc.ProductVariants = pc.ProductVariants
                    .Where(pv => pv.Size != null)
                    .OrderBy(pv =>
                    {
                        var tpl = pv.Size.CategorySizeTemplates
                            .FirstOrDefault(t => t.CategoryId == product.CategoryId);
                        return tpl?.MaxBust ?? 0;
                    })
                    .ThenBy(pv =>
                    {
                        var tpl = pv.Size.CategorySizeTemplates
                            .FirstOrDefault(t => t.CategoryId == product.CategoryId);
                        return tpl?.MaxWaist ?? 0;
                    })
                    .ToList();
            }
            return await this.MapToResponseProductDto(product);
        }

        public async Task<Pagination<ResponseProductDto>> GetProductWithColorRecommentAsync(PaginationParameter pagination, string hexcode, string catergory)
        {
            List<int> matchedColors = await _colorRecommendationSerivce.GetListHexcodeRecommend(hexcode);
            
            List<Product> recommendedProduct = await _productRepository.GetProductWithColorRecommend(matchedColors, catergory, pagination);

            List<ResponseProductDto> responseProduct = new List<ResponseProductDto>();
            foreach (Product item in recommendedProduct)
            {
                responseProduct.Add(await this.MapToResponseProductDto(item));
            }
            int countTotal = await _productRepository.CountProductWithColorRecommend(matchedColors,catergory);
            return new Pagination<ResponseProductDto>(responseProduct, countTotal, pagination.PageIndex, pagination.PageSize);
        }
    }
}
