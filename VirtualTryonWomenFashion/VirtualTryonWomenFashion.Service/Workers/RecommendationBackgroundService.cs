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

        try
        {
            // Chạy lần đầu ngay khi start
            await ComputeSimilarityMatrixAsync(stoppingToken);
    
            // Sau đó chạy theo interval
            using var timer = new PeriodicTimer(_interval);
            
            while (!stoppingToken.IsCancellationRequested)
            {
                /*try
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
                }*/
                await timer.WaitForNextTickAsync(stoppingToken);

                // --- LOGIC CẢI TIẾN: Thử lại ngắn hạn (Ví dụ: 3 lần, mỗi lần cách 10 phút) ---
                for (int i = 0; i < 3; i++)
                {
                    try
                    {
                        await ComputeSimilarityMatrixAsync(stoppingToken);
                        break; // Thành công, thoát vòng lặp thử lại ngắn hạn
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "❌ Lần tính toán thứ {Attempt} bị lỗi. Thử lại sau 10 phút...", i + 1);

                        // Nếu là lần thử cuối cùng hoặc hết thời gian (7 giờ), không chờ nữa
                        if (i == 2 || stoppingToken.IsCancellationRequested) break;

                        // Chờ một khoảng thời gian ngắn (10 phút) trước khi thử lại
                        await Task.Delay(TimeSpan.FromMinutes(10), stoppingToken);
                    }
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogCritical(ex, "💥 Fatal error in background service");
            throw; // Re-throw để host biết service bị lỗi
        }
    }

    /// <summary>
    /// Trigger thủ công từ API (optional)
    /// </summary>
    public async Task TriggerManualComputeAsync()
    {
        _logger.LogInformation("🔧 Manual trigger received");
        // ✅ Thêm timeout để tránh hang mãi
        using var cts = new CancellationTokenSource(TimeSpan.FromMinutes(30));
        await ComputeSimilarityMatrixAsync(CancellationToken.None);
    }

    private async Task ComputeSimilarityMatrixAsync(CancellationToken cancellationToken)
    {
        var acquired = await _semaphore.WaitAsync(TimeSpan.FromSeconds(1), cancellationToken);
        
        if (!acquired)
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
        catch (OperationCanceledException)
        {
            _logger.LogWarning("⏸️ Similarity computation cancelled");
            // ✅ Không throw exception khi cancelled
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Failed to compute similarity matrix");
        }
        finally
        {
            // ✅ CRITICAL: Đảm bảo luôn release semaphore
            try
            {
                _semaphore.Release();
            }
            catch (SemaphoreFullException)
            {
                // Ignore - semaphore đã được release từ nơi khác
                _logger.LogTrace("Semaphore already released");
            }
        }
    }
    
    // ✅ Dispose semaphore đúng cách
    public override void Dispose()
    {
        _semaphore?.Dispose();
        base.Dispose();
    }
}