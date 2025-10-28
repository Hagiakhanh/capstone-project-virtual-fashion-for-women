using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Workers;

public class RecommendationBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ILogger<RecommendationBackgroundService> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromHours(6);
    
    // Semaphore để tránh chạy nhiều tasks đồng thời
    private readonly SemaphoreSlim _semaphore = new(1, 1);
    
    public RecommendationBackgroundService(
        IServiceScopeFactory serviceScopeFactory,
        ILogger<RecommendationBackgroundService> logger)
    {
        _serviceScopeFactory = serviceScopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("🚀 Item Similarity Background Job started");

        // Chạy lần đầu ngay khi start
        await ComputeSimilarityMatrixAsync(stoppingToken);

        // Sau đó chạy theo interval
        using var timer = new PeriodicTimer(_interval);
        
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await timer.WaitForNextTickAsync(stoppingToken);
                await ComputeSimilarityMatrixAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("⏸️ Background job stopped");
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Error in background job timer");
            }
        }
    }

    /// <summary>
    /// Trigger thủ công từ API (optional)
    /// </summary>
    public async Task TriggerManualComputeAsync()
    {
        _logger.LogInformation("🔧 Manual trigger received");
        await ComputeSimilarityMatrixAsync(CancellationToken.None);
    }

    private async Task ComputeSimilarityMatrixAsync(CancellationToken cancellationToken)
    {
        // Tránh chạy song song nhiều lần
        if (!await _semaphore.WaitAsync(0))
        {
            _logger.LogWarning("⚠️ Similarity computation already in progress, skipping...");
            return;
        }

        try
        {
            var startTime = DateTime.Now;
            _logger.LogInformation("⏱️ Starting similarity matrix computation...");

            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var builder = scope.ServiceProvider
                    .GetRequiredService<IItemSimilarityMatrixBuilder>();

                await builder.BuildAndCacheAsync(cancellationToken);
            }

            var duration = DateTime.Now - startTime;
            _logger.LogInformation(
                "✅ Similarity matrix computed successfully in {Duration}ms", 
                duration.TotalMilliseconds);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to compute similarity matrix");
        }
        finally
        {
            _semaphore.Release();
        }
    }
}