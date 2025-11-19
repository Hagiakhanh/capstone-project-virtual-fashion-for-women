using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services;

public class ItemSimilarityMatrixBuilder : IItemSimilarityMatrixBuilder
{
    private readonly IUserInteractionRepository _userInteractionRepository;
    private readonly IOrderDetailRepository _orderDetailRepository;
    private readonly IWishlistRepository _wishlistRepository;
    private readonly IRedisCacheService _redisCacheService;
    private readonly ILogger<ItemSimilarityMatrixBuilder> _logger;

    // Shared cache CỤC BỘ (L1 Cache) giữa các requests
    private static readonly object _cacheLock = new object();
    private static ConcurrentDictionary<string, Dictionary<string, double>> _cache = new();
    private static DateTime _lastUpdate = DateTime.MinValue;
    //private static readonly TimeSpan CacheValidity = TimeSpan.FromHours(6);
    private static readonly TimeSpan LocalCacheValidity = TimeSpan.FromMinutes(30);
    
    // ✅ 3. Key cho ma trận trên Redis (L2 Cache)
    private const string REDIS_MATRIX_KEY = "cache:similarity_matrix";
    private static readonly TimeSpan RedisCacheExpiry = TimeSpan.FromHours(7); // Hơi lâu hơn interval (6h)
    
    private const int TopKSimilarItems = 15;
    private const int MinSharedUsers = 2; // Tối thiểu 2 users chung
    private const int MaxCacheItems = 10000;

    public ItemSimilarityMatrixBuilder(
        IUserInteractionRepository userInteractionRepository,
        IOrderDetailRepository orderDetailRepository,
        IWishlistRepository wishlistRepository,
        IRedisCacheService redisCacheService,
        ILogger<ItemSimilarityMatrixBuilder> logger)
    {
        _userInteractionRepository = userInteractionRepository;
        _orderDetailRepository = orderDetailRepository;
        _wishlistRepository = wishlistRepository;
        _redisCacheService = redisCacheService;
        _logger = logger;
    }

    public Dictionary<string, Dictionary<string, double>> GetCachedMatrix()
    {
        //return _cache.ToDictionary(x => x.Key, x => x.Value);
        lock (_cacheLock)
        {
            if (!_cache.Any())
                return new Dictionary<string, Dictionary<string, double>>();
                
            // Tạo deep copy để tránh race condition
            return _cache.ToDictionary(
                x => x.Key, 
                x => new Dictionary<string, double>(x.Value)
            );
        }
    }
    
    public async Task<Dictionary<string, Dictionary<string, double>>> GetCachedMatrixAsync()
    {
        lock (_cacheLock)
        {
            // 1. Kiểm tra L1 Cache (Static) trước
            if (_cache.Any() && DateTime.Now - _lastUpdate < LocalCacheValidity)
            {
                _logger.LogTrace("Cache HIT: L1 (Static)");
                // Cache cục bộ còn hạn, dùng luôn (siêu nhanh)
                return _cache.ToDictionary(
                    x => x.Key, 
                    x => new Dictionary<string, double>(x.Value)
                );
            }
        }
        
        // 2. L1 Cache miss hoặc hết hạn
        _logger.LogInformation("🔄 L1 (Static) cache miss or expired. Fetching from L2 (Redis)...");
        
        // 3. Lấy từ L2 Cache (Redis) - đây là thao tác I/O
        var matrixFromRedis = await _redisCacheService.GetData<ConcurrentDictionary<string, Dictionary<string, double>>>(REDIS_MATRIX_KEY);

        if (matrixFromRedis != null && matrixFromRedis.Any())
        {
            _logger.LogInformation("✅ Fetched matrix from Redis. Populating L1 (Static) cache...");
                
            // 4. Cập nhật L1 cache cục bộ
            lock (_cacheLock)
            {
                _cache = matrixFromRedis;
                _lastUpdate = DateTime.Now;
            }
            
            // Trả về bản copy
            return matrixFromRedis.ToDictionary(
                x => x.Key, 
                x => new Dictionary<string, double>(x.Value)
            );
        }

        // 5. Redis cũng không có (lỗi hoặc service nền chưa chạy)
        _logger.LogWarning("⚠️ Matrix not found in L2 (Redis) cache. Returning empty matrix.");
        
        // Xóa cache cục bộ để đảm bảo an toàn
        lock (_cacheLock)
        {
            _cache.Clear();
            _lastUpdate = DateTime.MinValue;
        }
        
        return new Dictionary<string, Dictionary<string, double>>();
    }

    public void InvalidateCache()
    {
        lock (_cacheLock)
        {
            _cache.Clear();
                    _lastUpdate = DateTime.MinValue;
                    _logger.LogInformation("🗑️ Cache invalidated");
        }
    }
    
    public async Task InvalidateCacheAsync() // ✅ 5. Đổi sang async
    {
        lock (_cacheLock)
        {
            _cache.Clear();
            _lastUpdate = DateTime.MinValue;
            _logger.LogInformation("🗑️ L1 (Static) cache invalidated");
        }
        
        // Xóa cả trên Redis
        await _redisCacheService.RemoveData(REDIS_MATRIX_KEY);
        _logger.LogInformation("🗑️ L2 (Redis) cache invalidated");
    }

    public async Task BuildAndCacheAsync(CancellationToken cancellationToken = default)
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();

        try
        {
            // ===== STEP 1: Lấy dữ liệu =====
            _logger.LogInformation("📥 Fetching data...");
            var allInteractions = await _userInteractionRepository.GetAllInteractionsAsync();
            var allOrders = await _orderDetailRepository.GetAllOrderDetailsAsync();
            var wishlist = await _wishlistRepository.GetAllWishlistAsync();

            _logger.LogInformation(
                "✅ Data fetched: {Interactions} interactions, {Orders} orders, {Wishlist} wishlist items",
                allInteractions.Count(), allOrders.Count(), wishlist.Count());

            // ✅ FIX: Early return nếu không có data
            if (!allInteractions.Any() && !allOrders.Any() && !wishlist.Any())
            {
                _logger.LogWarning("⚠️ No data available for building similarity matrix");
                await InvalidateCacheAsync();
                return;
            }

            // ===== STEP 2: Gộp hành vi người dùng =====
            _logger.LogInformation("🔄 Building user behavior vectors...");
            var userBehavior = new Dictionary<int, Dictionary<string, decimal>>();

            foreach (var i in allInteractions)
            {
                if (i?.ProductId == null || i.UserId == 0) continue;

                if (!userBehavior.ContainsKey(i.UserId))
                    userBehavior[i.UserId] = new Dictionary<string, decimal>();

                var weight = i.Weight ?? ComputeInteractionWeight(i.InteractionType);
                if (!userBehavior[i.UserId].ContainsKey(i.ProductId))
                    userBehavior[i.UserId][i.ProductId] = 0;
                userBehavior[i.UserId][i.ProductId] += weight;
            }

            foreach (var w in wishlist)
            {
                if (!userBehavior.ContainsKey(w.UserId))
                    userBehavior[w.UserId] = new Dictionary<string, decimal>();

                if (!userBehavior[w.UserId].ContainsKey(w.ProductId))
                    userBehavior[w.UserId][w.ProductId] = 0;
                userBehavior[w.UserId][w.ProductId] += 3;
            }

            foreach (var o in allOrders.Where(o => o.Order.Status == "Completed"))
            {
                var product = o.ProductVariant?.ProductColor?.Product;
                if (product == null || o.Order == null) continue;

                if (!userBehavior.ContainsKey(o.Order.CustomerId))
                    userBehavior[o.Order.CustomerId] = new Dictionary<string, decimal>();

                if (!userBehavior[o.Order.CustomerId].ContainsKey(product.ProductId))
                    userBehavior[o.Order.CustomerId][product.ProductId] = 0;
                userBehavior[o.Order.CustomerId][product.ProductId] += 5;
            }

            _logger.LogInformation("✅ User behavior vectors built: {Users} users", userBehavior.Count);

            // ===== STEP 3: Xây dựng Item Vectors =====
            _logger.LogInformation("🔄 Building item vectors...");
            var itemVectors = new Dictionary<string, Dictionary<int, decimal>>();

            foreach (var (uid, products) in userBehavior)
            {
                foreach (var (pid, w) in products)
                {
                    if (!itemVectors.ContainsKey(pid))
                        itemVectors[pid] = new Dictionary<int, decimal>();
                    itemVectors[pid][uid] = w;
                }
            }
            
            // ✅ FIX: Kiểm tra giới hạn cache
            if (itemVectors.Count > MaxCacheItems)
            {
                _logger.LogWarning(
                    "⚠️ Too many items ({Count}), limiting to top {Max} by user count",
                    itemVectors.Count, MaxCacheItems);
                
                itemVectors = itemVectors
                    .OrderByDescending(x => x.Value.Count)
                    .Take(MaxCacheItems)
                    .ToDictionary(x => x.Key, x => x.Value);
            }

            _logger.LogInformation("✅ Item vectors built: {Items} items", itemVectors.Count);

            // ===== STEP 4: Tính Similarity Matrix (Parallel) =====
            _logger.LogInformation("🔄 Computing similarity matrix (parallel)...");
            var similarityMatrix = new ConcurrentDictionary<string, Dictionary<string, double>>();
            var productIds = itemVectors.Keys.ToList();

            var processedCount = 0;
            var totalItems = productIds.Count;

            if (totalItems == 0)
            {
                _logger.LogWarning("⚠️ No items to process");
                return;
            }
            
            var parallelOptions = new ParallelOptions 
            { 
                MaxDegreeOfParallelism = Environment.ProcessorCount,
                CancellationToken = cancellationToken
            };

            await Task.Run(() =>
            {
                // ✅ Check cancellation
                cancellationToken.ThrowIfCancellationRequested();
                
                Parallel.ForEach(productIds, parallelOptions, pA =>
                {
                    var similarities = new Dictionary<string, double>();

                    foreach (var pB in productIds)
                    {
                        if (pA == pB) continue;

                        var sim = ComputeItemSimilarity(itemVectors[pA], itemVectors[pB]);
                        if (sim > 0)
                            similarities[pB] = sim;
                    }

                    // Chỉ giữ top K
                    var topK = similarities
                        .OrderByDescending(x => x.Value)
                        .Take(TopKSimilarItems)
                        .ToDictionary(x => x.Key, x => x.Value);

                    if (topK.Any())
                        similarityMatrix[pA] = topK;
                    
                    var count = Interlocked.Increment(ref processedCount);
                    var logStep = Math.Max(1, totalItems / 10);
                    
                    if (count % logStep == 0 || count == totalItems)
                    {
                        var progress = (count * 100.0 / totalItems);
                        _logger.LogInformation("⏳ Progress: {Progress:F1}% ({Count}/{Total})", 
                            progress, count, totalItems);
                    }
                });
            }, cancellationToken);
            
            if (cancellationToken.IsCancellationRequested)
            {
                _logger.LogWarning("⏸️ Similarity matrix building was cancelled before caching");
                return;
            }
            
            // ===== STEP 5: Cập nhật cache =====
            // 5a. Lưu vào L2 Cache (Redis) - Đây là nguồn chân lý
            _logger.LogInformation("💾 Storing matrix in L2 (Redis)...");
            await _redisCacheService.SetData(REDIS_MATRIX_KEY, similarityMatrix, RedisCacheExpiry);
            
            // 5b. Cập nhật L1 Cache (Static) cục bộ
            _logger.LogInformation("💾 Updating L1 (Static) cache...");
            lock (_cacheLock)
            {
                _cache = similarityMatrix;
                _lastUpdate = DateTime.Now;
            }

            sw.Stop();
            _logger.LogInformation(
                "✅ Similarity matrix cached: {MatrixSize} items with top-{TopK} similarities each. " +
                "Total time: {Duration}ms",
                similarityMatrix.Count, TopKSimilarItems, sw.ElapsedMilliseconds);
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("⏸️ Similarity matrix building was cancelled");
            throw; // Re-throw để caller biết
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Fatal error building similarity matrix");
            throw; // Re-throw để caller handle
        }
    }

    private static decimal ComputeInteractionWeight(string type)
    {
        if (string.IsNullOrEmpty(type)) return 0;
        return type.ToLower() switch
        {
            "view" => 1,
            "addtocart" => 3,
            "review" => 4,
            _ => 0
        };
    }

    private double ComputeItemSimilarity(
        Dictionary<int, decimal> itemA,
        Dictionary<int, decimal> itemB)
    {
        // ✅ FIX: Null checks
        if (itemA == null || itemB == null || !itemA.Any() || !itemB.Any())
            return 0;
        var sharedUsers = itemA.Keys.Intersect(itemB.Keys).ToList();
        if (sharedUsers.Count < MinSharedUsers) return 0;

        double numerator = sharedUsers.Sum(u => (double)(itemA[u] * itemB[u]));
        double denomA = Math.Sqrt(itemA.Values.Sum(v => Math.Pow((double)v, 2)));
        double denomB = Math.Sqrt(itemB.Values.Sum(v => Math.Pow((double)v, 2)));
        
        // ✅ FIX: Prevent NaN
        if (denomA == 0 || denomB == 0 || double.IsNaN(denomA) || double.IsNaN(denomB))
            return 0;
        var similarity = numerator / (denomA * denomB);
        
        // ✅ FIX: Validate result
        return double.IsNaN(similarity) || double.IsInfinity(similarity) ? 0 : similarity;
    }
}
    