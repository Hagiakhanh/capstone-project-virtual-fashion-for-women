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
    public class OrderCompleteWorkerService : BackgroundService
    {
        private readonly ILogger<OrderCompleteWorkerService> _logger;
        private readonly IServiceScopeFactory _serviceScopeFactory;
        private readonly TimeSpan _period = TimeSpan.FromMinutes(60);

        public OrderCompleteWorkerService(ILogger<OrderCompleteWorkerService> logger, IServiceScopeFactory serviceScopeFactory)
        {
            _logger = logger;
            _serviceScopeFactory = serviceScopeFactory;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Order update complete service is starting.");
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

                            await orderService.UpdateOrderCompleteAll();

                            _logger.LogInformation("Order update complete service is running.");
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error executing order update complete task.");
                        }
                    }
                }
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Order update complete service is stopped.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unknown error in order update complete service main loop.");
            }
        }
    }
}
