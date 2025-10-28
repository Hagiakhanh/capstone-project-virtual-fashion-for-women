using System.Collections.Concurrent;
using AutoMapper;
using Microsoft.AspNetCore.Http;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Product;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class RecommendationService : IRecommendationService
    {
        private readonly IProductRepository _productRepository;
        private readonly IUserInteractionRepository _userInteractionRepository;
        private readonly IOrderDetailRepository _orderDetailRepository;
        private readonly IWishlistRepository _wishlistRepository;
        private readonly IItemSimilarityMatrixBuilder _matrixBuilder;
        private readonly IMapper _mapper;
        private readonly IProductInSaleCampaignService _productInSaleCampaignService;
        private readonly IHttpContextAccessor _httpContextAccessor;

        private const double Alpha = 0.6; // 60% collaborative + 40% content-based

        public RecommendationService(
            IProductRepository productRepository,
            IUserInteractionRepository userInteractionRepository,
            IOrderDetailRepository orderDetailRepository,
            IWishlistRepository wishlistRepository,
            IItemSimilarityMatrixBuilder matrixBuilder,
            IMapper mapper,
            IProductInSaleCampaignService productInSaleCampaignService,
            IHttpContextAccessor httpContextAccessor)
        {
            _productRepository = productRepository;
            _userInteractionRepository = userInteractionRepository;
            _orderDetailRepository = orderDetailRepository;
            _wishlistRepository = wishlistRepository;
            _matrixBuilder = matrixBuilder;
            _mapper = mapper;
            _productInSaleCampaignService = productInSaleCampaignService;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<List<ResponseProductDto>> GetHybridRecommendationsAsync(int topN = 8)
        {
            //---------------------------------------------------------------------------------------------
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
            if (!userId.HasValue)
            {
                // Gọi fallback với userId là null
                return await GetFallbackRecommendationsAsync(topN, null);
            }
            
            HashSet<string> userWishlistProductIds = (await _wishlistRepository
                    .GetUserWishlistProductIdsAsync(userId.Value)).ToHashSet();
            
            // ===== 1️⃣ Lấy similarity matrix từ cache =====
            var itemSimilarityMatrix = _matrixBuilder.GetCachedMatrix();

            // Nếu cache chưa có, return fallback
            if (!itemSimilarityMatrix.Any())
            {
                return await GetFallbackRecommendationsAsync(topN, userId);
            }

            // ===== 2️⃣ Lấy products =====
            var allProducts = await _productRepository.GetAllProductsWithIncludes();
            var activeProducts = allProducts.Where(p => p.IsDeleted == false).ToList();

            // ===== 3️⃣ Lấy hành vi của user hiện tại =====
            var currentUserProducts = await GetUserBehaviorVectorAsync(userId.Value);

            // ===== 4️⃣ User mới → Fallback =====
            var productDtos = new List<ResponseProductDto>();
            if (!currentUserProducts.Any())
            {
                // return activeProducts
                //     .OrderByDescending(p => p.CreatedAt)
                //     .Take(topN)
                //     .ToList();
                // Lấy product thô
                var fallbackProducts = activeProducts
                    .OrderByDescending(p => p.CreatedAt)
                    .Take(topN)
                    .ToList();

                // Map sang DTO và xử lý logic nghiệp vụ
                productDtos = fallbackProducts.Select(p =>
                {
                    var dto = _mapper.Map<ResponseProductDto>(p);

                    // Lấy giá sale
                    var productActiveInSaleCampaign = _productInSaleCampaignService.GetPriceOfProductInActiveCampaign(p.ProductId);
                    dto.PriceAtTime = productActiveInSaleCampaign.Result != null
                        ? productActiveInSaleCampaign.Result.SalePrice
                        : dto.Price;

                    // Kiểm tra wishlist
                    dto.IsInWishlist = userWishlistProductIds.Contains(p.ProductId);
        
                    return dto;
                }).ToList();

                return productDtos; // <-- Đã trả về List<ResponseProductDto>
            }

            // ===== 5️⃣ Tính Item-Item Collaborative Score =====
            var itemCollabScores = new Dictionary<string, double>();

            foreach (var (pA, userWeight) in currentUserProducts)
            {
                if (!itemSimilarityMatrix.ContainsKey(pA)) continue;

                foreach (var (pB, similarity) in itemSimilarityMatrix[pA])
                {
                    if (currentUserProducts.ContainsKey(pB)) continue;

                    if (!itemCollabScores.ContainsKey(pB))
                        itemCollabScores[pB] = 0;

                    itemCollabScores[pB] += similarity * (double)userWeight;
                }
            }

            // Normalize
            double totalUserWeight = (double)currentUserProducts.Values.Sum();
            if (totalUserWeight > 0)
            {
                foreach (var key in itemCollabScores.Keys.ToList())
                    itemCollabScores[key] /= totalUserWeight;
            }

            // ===== 6️⃣ Kết hợp Content-based =====
            var hybridScores = new List<(Product product, double score)>();

            foreach (var candidate in activeProducts)
            {
                if (currentUserProducts.ContainsKey(candidate.ProductId))
                    continue;

                var collabScore = itemCollabScores.ContainsKey(candidate.ProductId)
                    ? itemCollabScores[candidate.ProductId]
                    : 0;

                var contentScore = currentUserProducts.Keys
                    .Select(pid =>
                    {
                        var product = activeProducts.FirstOrDefault(p => p.ProductId == pid);
                        return product != null
                            ? ComputeContentSimilarity(product, candidate)
                            : 0;
                    })
                    .DefaultIfEmpty(0)
                    .Average();

                var hybridScore = Alpha * collabScore + (1 - Alpha) * contentScore;

                if (hybridScore > 0)
                    hybridScores.Add((candidate, hybridScore));
            }

            // ===== 7️⃣ Trả về top N =====
            // return hybridScores
            //     .OrderByDescending(x => x.score)
            //     .Take(topN)
            //     .Select(x => x.product)
            //     .ToList();
            // Lấy danh sách Product thô
            var recommendedProducts = hybridScores
                .OrderByDescending(x => x.score)
                .Take(topN)
                .Select(x => x.product)
                .ToList();

            // ===== 4. Map DTO và xử lý logic nghiệp vụ (giống hệt bên Search) =====
            productDtos = recommendedProducts.Select(p =>
            {
                // Dùng AutoMapper để map các trường cơ bản
                var dto = _mapper.Map<ResponseProductDto>(p); 

                // Xử lý logic PriceAtTime
                // (LƯU Ý: GetPriceOfProductInActiveCampaign là async, 
                // nhưng .Select() của LINQ không phải async-aware. 
                // Bạn nên gọi .Result nếu chắc chắn nó nhanh, hoặc dùng Task.WhenAll)
                var productActiveInSaleCampaign = _productInSaleCampaignService.GetPriceOfProductInActiveCampaign(p.ProductId);
                dto.PriceAtTime = productActiveInSaleCampaign.Result != null
                    ? productActiveInSaleCampaign.Result.SalePrice
                    : dto.Price;

                // Xử lý logic IsInWishlist
                dto.IsInWishlist = userWishlistProductIds.Contains(p.ProductId);
        
                return dto;
            }).ToList();

            return productDtos;
        }

        private async Task<Dictionary<string, decimal>> GetUserBehaviorVectorAsync(int userId)
        {
            var userInteractions = await _userInteractionRepository.GetInteractionByUserIdAsync(userId);
            var userOrders = await _orderDetailRepository.GetUserOrderDetailsAsync(userId);
            var userWishlist = await _wishlistRepository.GetUserWishlistAsync(userId);

            var result = new Dictionary<string, decimal>();

            foreach (var i in userInteractions)
            {
                var weight = i.Weight ?? ComputeInteractionWeight(i.InteractionType);
                if (!result.ContainsKey(i.ProductId))
                    result[i.ProductId] = 0;
                result[i.ProductId] += weight;
            }

            foreach (var w in userWishlist)
            {
                if (!result.ContainsKey(w.ProductId))
                    result[w.ProductId] = 0;
                result[w.ProductId] += 4;
            }

            foreach (var o in userOrders)
            {
                var product = o.ProductVariant?.ProductColor?.Product;
                if (product == null) continue;

                if (!result.ContainsKey(product.ProductId))
                    result[product.ProductId] = 0;
                result[product.ProductId] += 5;
            }

            return result;
        }

        // private async Task<List<Product>> GetFallbackRecommendationsAsync(int topN)
        // {
        //     var allProducts = await _productRepository.GetAllProductsWithIncludes();
        //     return allProducts
        //         .Where(p => p.IsDeleted == false)
        //         .OrderByDescending(p => p.CreatedAt)
        //         .Take(topN)
        //         .ToList();
        // }
        
        private async Task<List<ResponseProductDto>> GetFallbackRecommendationsAsync(int topN, int? userId)
        {
            HashSet<string> userWishlistProductIds = new HashSet<string>();
            
            if (userId.HasValue)
            {
                userWishlistProductIds = (await _wishlistRepository
                        .GetUserWishlistProductIdsAsync(userId.Value))
                    .ToHashSet();
            }
            
            var allProducts = await _productRepository.GetAllProductsWithIncludes();
    
            var fallbackProducts = allProducts
                .Where(p => p.IsDeleted == false)
                .OrderByDescending(p => p.CreatedAt)
                .Take(topN)
                .ToList();

            // Map tương tự
            var productDtos = fallbackProducts.Select(p =>
            {
                var dto = _mapper.Map<ResponseProductDto>(p);
        
                var productActiveInSaleCampaign = _productInSaleCampaignService.GetPriceOfProductInActiveCampaign(p.ProductId);
                dto.PriceAtTime = productActiveInSaleCampaign.Result != null
                    ? productActiveInSaleCampaign.Result.SalePrice
                    : dto.Price;
            
                dto.IsInWishlist = userWishlistProductIds.Contains(p.ProductId);
        
                return dto;
            }).ToList();
    
            return productDtos;
        }

        private static decimal ComputeInteractionWeight(string type)
        {
            return type.ToLower() switch
            {
                "view" => 1,
                "wishlist" => 3,
                "addtocart" => 3,
                "purchase" => 5,
                "review" => 4,
                _ => 0
            };
        }

        private static double ComputeContentSimilarity(Product a, Product b)
        {
            double score = 0;

            if (a.CategoryId == b.CategoryId)
                score += 0.5;

            var tagOverlap = a.Tags.Select(t => t.TagId)
                .Intersect(b.Tags.Select(t => t.TagId)).Count();
            var totalTags = a.Tags.Select(t => t.TagId)
                .Union(b.Tags.Select(t => t.TagId)).Count();

            if (totalTags > 0)
                score += 0.3 * (tagOverlap / (double)totalTags);

            if (a.Price.HasValue && b.Price.HasValue)
            {
                var diff = Math.Abs(a.Price.Value - b.Price.Value);
                if (diff < 200000) score += 0.2;
            }

            return Math.Min(score, 1.0);
        }
    }
}