using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
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

        public ProductService(IUnitOfWork unitOfWork, IProductRepository productRepository,
            IProductColorService productColorService,
            /*IProductImageService productImageService,
            IProductVariantService productVariantService,*/
            ICloudinaryService cloudinaryService,
            IColorRepository colorRepository,
            IProductColorRepository productColorRepository,
            ISizeRepository sizeRepository,
            IProductVariantRepository productVariantRepository)
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
                return result + "-";
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

        /*public async Task<ResponsePaginationModel<List<ResponseProductDto>>> GetAllProductsAsync(PaginationParams pagination)
        {
            // Get products with pagination and includes
            var products = await _productRepository.GetAll(
                pagination: pagination,
                filter: p => p.IsDeleted != true,
                orderBy: q => q.OrderByDescending(p => p.CreatedAt),
                includes: new Expression<Func<Product, object>>[]
                {
                p => p.Category,
                p => p.ProductColors
                }
            );

            // Get total count for pagination info
            var totalRecords = await _productRepository.Count(p => p.IsDeleted != true);
            var totalPages = (int)Math.Ceiling((double)totalRecords / pagination.PageSize);

            // Load additional related data manually since ThenInclude doesn't work with Expression<Func<T, object>>[]
            foreach (var product in products)
            {
                await _context.Entry(product)
                    .Collection(p => p.ProductColors)
                    .Query()
                    .Include(pc => pc.Color)
                    .Include(pc => pc.ProductImages)
                    .Include(pc => pc.ProductVariants)
                        .ThenInclude(pv => pv.Size)
                    .LoadAsync();
            }

            // Map to DTOs
            var productDtos = products.Select(product => MapToResponseProductDto(product)).ToList();

            return new ResponsePaginationModel<List<ResponseProductDto>>(
                statusCode: 200,
                data: productDtos,
                totalRecords: totalRecords,
                totalPages: totalPages
            );
        }*/

        private ResponseProductDto MapToResponseProductDto(Product product)
        {
            return new ResponseProductDto
            {
                ProductId = product.ProductId,
                ProductName = product.ProductName,
                ProductSlug = product.ProductSlug,
                Price = product.Price,
                Description = product.Description,
                MainImageUrl = product.MainImageUrl,
                CreatedAt = product.CreatedAt,
                ProductColors = product.ProductColors.Select(pc => new ResponseProductColorDto
                {
                    ProductColorId = pc.ProductColorId,
                    ColorId = pc.ColorId,
                    LensId = pc.LensId,
                    Color = pc.Color != null ? new ResponseColorDto
                    {
                        ColorId = pc.Color.ColorId,
                        ColorName = pc.Color.ColorName,
                        ColorPrefix = pc.Color.ColorPrefix,
                        HexCode = pc.Color.HexCode
                    } : null,
                    ProductVariants = pc.ProductVariants.Select(pv => new ResponseProductVariantDto
                    {
                        ProductVariantId = pv.ProductVariantId,
                        SizeId = pv.SizeId,
                        VariantName = pv.VariantName,
                        Quantity = pv.Quantity,
                        ImageUrl = pv.ImageUrl,
                        Status = pv.Status,
                        ProductWeight = pv.ProductWeight,
                        ProductLength = pv.ProductLength,
                        ProductWidth = pv.ProductWidth,
                        ProductHeight = pv.ProductHeight,
                        Size = pv.Size != null ? new ResponseSizeDto
                        {
                            SizeId = pv.Size.SizeId,
                            SizeCode = pv.Size.SizeCode
                        } : null,
                        ProductImages = pc.ProductImages.Select(pi => new ResponseProductImageDto
                        {
                            ProductImageId = pi.ProductImageId,
                            ImageUrl = pi.ImageUrl
                        }).ToList()
                    }).ToList()
                }).ToList()
            };
        }

        public async Task<ResponseProductDto> GetProductBySlugAsync(string slug)
        {
            /*var product = await _productRepository.GetProductBySlugAsync(slug);

            if (product == null)
                return null;

            return new ResponseProductDto
            {
                ProductId = product.ProductId,
                ProductName = product.ProductName,
                ProductSlug = product.ProductSlug,
                Price = product.Price,
                Description = product.Description,
                MainImageUrl = product.MainImageUrl,
                CreatedAt = product.CreatedAt,
                CategoryId = product.Category.CategoryId,
                ProductColors = product.ProductColors.Select(pc => new ResponseProductColorDto
                {
                    ProductColorId = pc.ProductColorId,
                    ColorId = pc.ColorId,
                    LensId = pc.LensId,
                    Color = pc.Color != null ? new ResponseColorDto
                    {
                        ColorId = pc.Color.ColorId,
                        ColorName = pc.Color.ColorName,
                        ColorPrefix = pc.Color.ColorPrefix,
                        HexCode = pc.Color.HexCode
                    } : null,
                    ProductVariants = pc.ProductVariants.Select(pv => new ResponseProductVariantDto
                    {
                        ProductVariantId = pv.ProductVariantId,
                        SizeId = pv.SizeId,
                        VariantName = pv.VariantName,
                        Quantity = pv.Quantity,
                        ImageUrl = pv.ImageUrl, // Main image của variant
                        Status = pv.Status,
                        ProductWeight = pv.ProductWeight,
                        ProductLength = pv.ProductLength,
                        ProductWidth = pv.ProductWidth,
                        ProductHeight = pv.ProductHeight,
                        Size = pv.Size != null ? new ResponseSizeDto
                        {
                            SizeId = pv.Size.SizeId,
                            SizeCode = pv.Size.SizeCode
                        } : null,
                        // Tất cả images của ProductColor này, có thể filter theo variant nếu cần
                        ProductImages = pc.ProductImages.Select(pi => new ResponseProductImageDto
                        {
                            ProductImageId = pi.ProductImageId,
                            ImageUrl = pi.ImageUrl
                        }).ToList()
                    }).ToList()
                }).ToList()
            };*/
            var product = await _productRepository.GetProductBySlugAsync(slug);
            if (product == null)
                return null;

            return MapToResponseProductDto(product);
        }

        public async Task<ResponseProductDto> GetProductByVariantIdAsync(string variantId)
        {
            var product = await _productRepository.GetProductByVariantIdAsync(variantId);
            if (product == null)
                return null;

            return MapToResponseProductDto(product);
        }

        /*public async Task<MessageModelWithData<Product>> CreateProductAsync(CreateProductRequest request)
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
                    CategoryId = request.CategoryId
                };
                await _productRepository.InsertAsync(product);
                var result = await _unitOfWork.SaveChanges();

                // 2. Tạo ProductColors + Images + Variants
                foreach (var productColor in request.ProductColor)
                {
                    await _productColorService.CreateAsync(product.ProductId, productColor);
                }
                
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
        }*/

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
                    string productColorId = $"{product.ProductId}{colorId}";

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

        
    }
}
