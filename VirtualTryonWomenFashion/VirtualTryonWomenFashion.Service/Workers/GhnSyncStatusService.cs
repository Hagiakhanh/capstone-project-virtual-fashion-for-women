using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Workers
{
    public class GhnSyncStatusService : BackgroundService
    {
        private readonly ILogger<GhnSyncStatusService> _logger;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly TimeSpan _period = TimeSpan.FromMinutes(5);

        public GhnSyncStatusService(ILogger<GhnSyncStatusService> logger, IServiceScopeFactory serviceScopeFactory)
        {
            _logger = logger;
            _serviceScopeFactory = serviceScopeFactory;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("GHN state synchronization service is starting.");
            try
            {
                using var timer = new PeriodicTimer(_period);
                while (await timer.WaitForNextTickAsync(stoppingToken))
                {
                    using (var scope = _serviceScopeFactory.CreateScope())
                    {
                        try
                        {
                            var orderService = scope.ServiceProvider.GetRequiredService<IOrderService>();

                            var result = await orderService.UpdateAllOrderStatusInGHN();

                            _logger.LogInformation("GHN synchronization results: {Message}. Status Code: {StatusCode}",
                                result.Message, result.StatusCode);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error executing GHN state synchronization task.");
                        }
                    }
                }
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("GHN state synchronization service is stopped.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unknown error in GHN service main loop.");
            }
        }
    }
}
