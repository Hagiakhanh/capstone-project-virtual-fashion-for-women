using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Workers;

public class PaymentWorkerService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<PaymentWorkerService> _logger;

    public PaymentWorkerService(
        ILogger<PaymentWorkerService> logger,
        IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
    }
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Scheduled Background Service started");
        await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var paymentService = scope.ServiceProvider
                        .GetRequiredService<IPaymentService>();

                    // Gọi method của service
                    await paymentService.HandleOrderStatusAndTransactionStatus();
                    await paymentService.HandleRechargeTransactionStatus(); 
                }
                _logger.LogInformation("Function HandleOrderStatusAndTransactionStatus executed successfully at: {time}", DateTimeOffset.Now);
                _logger.LogInformation("Next execution scheduled in 15 minute");
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error when executing HandleOrderStatusAndTransactionStatus");
            }
            await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken); // Adjust the delay as needed
        }
        _logger.LogInformation("Scheduled Background Service stopped");
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("Scheduled Background Service is stopping");
        await base.StopAsync(cancellationToken);
    }
}