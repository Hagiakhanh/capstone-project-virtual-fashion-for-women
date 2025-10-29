using System.Collections.Concurrent;
using AutoMapper;
using Microsoft.AspNetCore.Http;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Product;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class ProductRecommendationCache
    {
        public string ProductId { get; set; }
        public string Name { get; set; }
        public decimal? Price { get; set; }
        public int? CategoryId { get; set; }
        public List<int> TagIds { get; set; } // Chỉ lưu ID thay vì object
        public DateTime CreatedAt { get; set; }
        public bool? IsDeleted { get; set; }
    }
    
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
        private readonly IRedisCacheService _redisCacheService;

        private const double Alpha = 0.6; // 60% collaborative + 40% content-based
        private const string CACHE_KEY_RECOMMENDATION_PRODUCTS = "products:recommendation_data";
        private const int FALLBACK_CANDIDATE_SIZE = 50; // Giới hạn ứng viên fallback

        public RecommendationService(
            IProductRepository productRepository,
            IUserInteractionRepository userInteractionRepository,
            IOrderDetailRepository orderDetailRepository,
            IWishlistRepository wishlistRepository,
            IItemSimilarityMatrixBuilder matrixBuilder,
            IMapper mapper,
            IProductInSaleCampaignService productInSaleCampaignService,
            IHttpContextAccessor httpContextAccessor,
            IRedisCacheService redisCacheService)
        {
            _productRepository = productRepository;
            _userInteractionRepository = userInteractionRepository;
            _orderDetailRepository = orderDetailRepository;
            _wishlistRepository = wishlistRepository;
            _matrixBuilder = matrixBuilder;
            _mapper = mapper;
            _productInSaleCampaignService = productInSaleCampaignService;
            _httpContextAccessor = httpContextAccessor;
            _redisCacheService = redisCacheService;
        }
        
        private async Task<List<ProductRecommendationCache>> GetCachedRecommendationProductsAsync()
        {
            const string cacheKey = CACHE_KEY_RECOMMENDATION_PRODUCTS;
            
            // 1. Thử lấy từ cache
            var cachedData = await _redisCacheService.GetData<List<ProductRecommendationCache>>(cacheKey);
            
            if (cachedData != null && cachedData.Any())
            {
                return cachedData;
            }
            
            var productList = await _productRepository.GetAllProductsWithIncludes();
            // 2. Cache miss: Query từ DB với projection
            var products = productList
                .Select(p => new ProductRecommendationCache
                {
                    ProductId = p.ProductId,
                    Name = p.ProductName,
                    Price = p.Price,
                    CategoryId = p.CategoryId,
                    TagIds = p.Tags.Select(t => t.TagId).ToList(), // ✅ Chỉ lấy TagId
                    CreatedAt = p.CreatedAt,
                    IsDeleted = p.IsDeleted
                }).ToList();
            
            // 3. Lưu vào cache (30 phút)
            if (products.Any())
            {
                await _redisCacheService.SetData(cacheKey, products, TimeSpan.FromMinutes(30));
            }
            
            return products;
        }
        
        // ✅ NEW: Helper method để tránh code duplicate và .Result blocking
        private async Task<List<ResponseProductDto>> MapToProductDtos(
            List<Product> products,
            HashSet<string> userWishlistProductIds)
        {
            if (!products.Any())
                return new List<ResponseProductDto>();

            // ✅ FIX: Batch load tất cả sale prices cùng lúc thay vì gọi từng cái
            var productIds = products.Select(p => p.ProductId).ToList();
            var salePrices = await GetBatchSalePricesAsync(productIds);

            return products.Select(p =>
            {
                var dto = _mapper.Map<ResponseProductDto>(p);

                // ✅ FIX: Dùng dictionary lookup thay vì .Result
                dto.PriceAtTime = salePrices.ContainsKey(p.ProductId)
                    ? salePrices[p.ProductId]
                    : dto.Price;

                dto.IsInWishlist = userWishlistProductIds.Contains(p.ProductId);

                return dto;
            }).ToList();
        }

        // ✅ NEW: Batch load sale prices để tránh N+1 query problem
        private async Task<Dictionary<string, decimal>> GetBatchSalePricesAsync(List<string> productIds)
        {
            return await _productInSaleCampaignService.GetPricesOfProductsInActiveCampaignAsync(productIds);
        }

        public async Task<List<ResponseProductDto>> GetHybridRecommendationsAsync(int topN = 8)
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
            if (!userId.HasValue)
            {
                // Gọi fallback với userId là null
                return await GetFallbackRecommendationsAsync(topN, null);
            }
            
            HashSet<string> userWishlistProductIds = (await _wishlistRepository
                    .GetUserWishlistProductIdsAsync(userId.Value)).ToHashSet();
            
            // ===== 1️⃣ Lấy similarity matrix từ cache =====
            //var itemSimilarityMatrix = _matrixBuilder.GetCachedMatrix();
            var itemSimilarityMatrix = await _matrixBuilder.GetCachedMatrixAsync();
            
            // Nếu cache chưa có, return fallback
            if (!itemSimilarityMatrix.Any())
            {
                return await GetFallbackRecommendationsAsync(topN, userId);
            }

            // ===== 2️⃣ Lấy products =====
            var allProducts = (await GetCachedRecommendationProductsAsync())
                .Where(p => p.IsDeleted == false)
                .ToList();

            // ===== 3️⃣ Lấy hành vi của user hiện tại =====
            var currentUserProducts = await GetUserBehaviorVectorAsync(userId.Value);

            // ===== 4️⃣ User mới → Fallback =====
            if (!currentUserProducts.Any())
            {
                var fallbackProductIds = allProducts
                    .OrderByDescending(p => p.CreatedAt)
                    .Take(topN)
                    .Select(p => p.ProductId)
                    .ToList();

                // Map sang DTO và xử lý logic nghiệp vụ
                return await GetProductDtosByIdsAsync(fallbackProductIds, userWishlistProductIds);
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
            var hybridScores = new List<(string productId, double score)>();
            
            var productCacheById = allProducts.ToDictionary(p => p.ProductId);

            // ✅ FIX #3: Giới hạn candidate set
            // Lấy ứng viên chính từ Collaborative Filtering
            var collabCandidates = itemCollabScores.Keys;

            // Lấy ứng viên fallback (sản phẩm mới nhất)
            var newProductCandidates = allProducts
                .OrderByDescending(p => p.CreatedAt)
                .Take(FALLBACK_CANDIDATE_SIZE)
                .Select(p => p.ProductId);
            
            // Gộp 2 tập ứng viên và loại bỏ trùng lặp
            var candidateIds = collabCandidates
                .Union(newProductCandidates)
                .ToHashSet(); // Dùng HashSet để gộp và loại trùng

            // ✅ FIX #3: Lặp qua TẬP ỨNG VIÊN (nhỏ) thay vì TẤT CẢ sản phẩm
            foreach (var candidateId in candidateIds)
            {
                // Lấy object product từ dictionary
                if (!productCacheById.TryGetValue(candidateId, out var candidate))
                    continue; // Bỏ qua nếu product không có (ví dụ: đã xóa)

                // Bỏ qua nếu user đã tương tác rồi
                if (currentUserProducts.ContainsKey(candidate.ProductId))
                    continue;

                var collabScore = itemCollabScores.ContainsKey(candidate.ProductId)
                    ? itemCollabScores[candidate.ProductId]
                    : 0;

                var contentScores = currentUserProducts.Select(pair =>
                {
                    var pid = pair.Key;
                    var userWeight = (double)pair.Value; // Trọng số từ user (mua, xem,...)
                    var product = productCacheById.ContainsKey(pid) ? productCacheById[pid] : null;

                    var sim = product != null
                        ? ComputeContentSimilarityFromCache(product, candidate)
                        : 0;

                    return (sim * userWeight);
                });

                double totalWeight = (double)currentUserProducts.Values.Sum();
                var contentScore = (totalWeight > 0) ? contentScores.Sum() / totalWeight : 0;

                var hybridScore = Alpha * collabScore + (1 - Alpha) * contentScore;

                if (hybridScore > 0)
                    hybridScores.Add((candidate.ProductId, hybridScore));
            }

            // ===== 7️⃣ Trả về top N =====
            var recommendedProductIds = hybridScores
                .OrderByDescending(x => x.score)
                .Take(topN)
                .Select(x => x.productId)
                .ToList();

            // ===== 4. Map DTO và xử lý logic nghiệp vụ (giống hệt bên Search) =====
            return await GetProductDtosByIdsAsync(recommendedProductIds, userWishlistProductIds);
        }
        
        private async Task<List<ResponseProductDto>> GetProductDtosByIdsAsync(
            List<string> productIds,
            HashSet<string> userWishlistProductIds)
        {
            if (!productIds.Any())
                return new List<ResponseProductDto>();

            // Load full entities với includes (không dùng cache ở đây)
            var products = await _productRepository.GetProductsByIdsWithIncludesAsync(productIds);

            if (!products.Any()) // ✅ Thêm null check
                return new List<ResponseProductDto>();
            // Sắp xếp theo thứ tự trong productIds
            var orderedProducts = productIds
                .Select(id => products.FirstOrDefault(p => p.ProductId == id))
                .Where(p => p != null)
                .ToList();

            return await MapToProductDtos(orderedProducts, userWishlistProductIds);
        }

        // ===== ✅ NEW: Content similarity dựa trên cache data =====
        private static double ComputeContentSimilarityFromCache(
            ProductRecommendationCache a,
            ProductRecommendationCache b)
        {
            double score = 0;

            // Category match
            if (a.CategoryId == b.CategoryId)
                score += 0.4;

            // Tag overlap (dùng TagIds thay vì Tag objects)
            var tagOverlap = a.TagIds.Intersect(b.TagIds).Count();
            var totalTags = a.TagIds.Union(b.TagIds).Count();

            if (totalTags > 0)
                score += 0.3 * (tagOverlap / (double)totalTags);

            // Price similarity
            if (a.Price.HasValue && b.Price.HasValue)
            {
                var diff = Math.Abs(a.Price.Value - b.Price.Value);
                if (diff < 200000) score += 0.2;
            }

            return Math.Min(score, 1.0);
        }

        // ===== ✅ UPDATED: Fallback =====
        private async Task<List<ResponseProductDto>> GetFallbackRecommendationsAsync(int topN, int? userId)
        {
            HashSet<string> userWishlistProductIds = new HashSet<string>();
            
            if (userId.HasValue)
            {
                userWishlistProductIds = (await _wishlistRepository
                    .GetUserWishlistProductIdsAsync(userId.Value))
                    .ToHashSet();
            }

            // Dùng cached data cho fallback
            var cachedProducts = (await GetCachedRecommendationProductsAsync())
                .Where(p => p.IsDeleted == false)
                .ToList();
            
            var fallbackProductIds = cachedProducts
                .OrderByDescending(p => p.CreatedAt)
                .Take(topN)
                .Select(p => p.ProductId)
                .ToList();

            return await GetProductDtosByIdsAsync(fallbackProductIds, userWishlistProductIds);
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
    }
}