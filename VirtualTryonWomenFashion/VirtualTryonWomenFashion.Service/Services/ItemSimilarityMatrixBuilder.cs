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
    private readonly ILogger<ItemSimilarityMatrixBuilder> _logger;

    // Shared cache giữa các requests
    private static ConcurrentDictionary<string, Dictionary<string, double>> _cache = new();
    private static DateTime _lastUpdate = DateTime.MinValue;
    private static readonly TimeSpan CacheValidity = TimeSpan.FromHours(6);
    
    private const int TopKSimilarItems = 15;
    private const int MinSharedUsers = 2; // Tối thiểu 2 users chung

    public ItemSimilarityMatrixBuilder(
        IUserInteractionRepository userInteractionRepository,
        IOrderDetailRepository orderDetailRepository,
        IWishlistRepository wishlistRepository,
        ILogger<ItemSimilarityMatrixBuilder> logger)
    {
        _userInteractionRepository = userInteractionRepository;
        _orderDetailRepository = orderDetailRepository;
        _wishlistRepository = wishlistRepository;
        _logger = logger;
    }

    public bool IsCacheValid()
    {
        return _cache.Any() && DateTime.Now - _lastUpdate < CacheValidity;
    }

    public Dictionary<string, Dictionary<string, double>> GetCachedMatrix()
    {
        return _cache.ToDictionary(x => x.Key, x => x.Value);
    }

    public void InvalidateCache()
    {
        _cache.Clear();
        _lastUpdate = DateTime.MinValue;
        _logger.LogInformation("🗑️ Cache invalidated");
    }

    public async Task BuildAndCacheAsync(CancellationToken cancellationToken = default)
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();

        // ===== STEP 1: Lấy dữ liệu =====
        _logger.LogInformation("📥 Fetching data...");
        var allInteractions = await _userInteractionRepository.GetAllInteractionsAsync();
        var allOrders = await _orderDetailRepository.GetAllOrderDetailsAsync();
        var wishlist = await _wishlistRepository.GetAllWishlistAsync();
        
        _logger.LogInformation(
            "✅ Data fetched: {Interactions} interactions, {Orders} orders, {Wishlist} wishlist items",
            allInteractions.Count(), allOrders.Count(), wishlist.Count());

        // ===== STEP 2: Gộp hành vi người dùng =====
        _logger.LogInformation("🔄 Building user behavior vectors...");
        var userBehavior = new Dictionary<int, Dictionary<string, decimal>>();

        foreach (var i in allInteractions)
        {
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
            userBehavior[w.UserId][w.ProductId] += 4;
        }

        foreach (var o in allOrders)
        {
            var product = o.ProductVariant?.ProductColor?.Product;
            if (product == null) continue;

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

        _logger.LogInformation("✅ Item vectors built: {Items} items", itemVectors.Count);

        // ===== STEP 4: Tính Similarity Matrix (Parallel) =====
        _logger.LogInformation("🔄 Computing similarity matrix (parallel)...");
        var similarityMatrix = new ConcurrentDictionary<string, Dictionary<string, double>>();
        var productIds = itemVectors.Keys.ToList();
        
        var processedCount = 0;
        var totalItems = productIds.Count;

        Parallel.ForEach(productIds, new ParallelOptions 
        { 
            MaxDegreeOfParallelism = Environment.ProcessorCount,
            CancellationToken = cancellationToken
        }, pA =>
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

            // Log progress mỗi 10%
            var count = Interlocked.Increment(ref processedCount);
            if (count % (totalItems / 10) == 0)
            {
                var progress = (count * 100.0 / totalItems);
                _logger.LogInformation("⏳ Progress: {Progress:F1}%", progress);
            }
        });

        // ===== STEP 5: Cập nhật cache =====
        _cache = similarityMatrix;
        _lastUpdate = DateTime.Now;

        sw.Stop();
        _logger.LogInformation(
            "✅ Similarity matrix cached: {MatrixSize} items with top-{TopK} similarities each. " +
            "Total time: {Duration}ms",
            similarityMatrix.Count, TopKSimilarItems, sw.ElapsedMilliseconds);
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

    private double ComputeItemSimilarity(
        Dictionary<int, decimal> itemA,
        Dictionary<int, decimal> itemB)
    {
        var sharedUsers = itemA.Keys.Intersect(itemB.Keys).ToList();
        if (sharedUsers.Count < MinSharedUsers) return 0;

        double numerator = sharedUsers.Sum(u => (double)(itemA[u] * itemB[u]));
        double denomA = Math.Sqrt(itemA.Values.Sum(v => Math.Pow((double)v, 2)));
        double denomB = Math.Sqrt(itemB.Values.Sum(v => Math.Pow((double)v, 2)));

        return (denomA == 0 || denomB == 0) ? 0 : numerator / (denomA * denomB);
    }
}
    