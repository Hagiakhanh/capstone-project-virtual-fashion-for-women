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
    public class SaleCampaignWorkerService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<SaleCampaignWorkerService> _logger;

        public SaleCampaignWorkerService(
            ILogger<SaleCampaignWorkerService> logger,
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
                        var saleCampaignService = scope.ServiceProvider
                            .GetRequiredService<ISaleCampaignService>();

                        // Gọi method của service
                        await saleCampaignService.ChangeStatusForExistingSaleCampaign();
                    }
                    _logger.LogInformation("Function ChangeStatusMeeting executed successfully at: {time}", DateTimeOffset.Now);
                    _logger.LogInformation("Next execution scheduled in 1 hour");
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    throw;
                }
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken); // Adjust the delay as needed
            }
            _logger.LogInformation("Scheduled Background Service stopped");
        }

        public override async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Scheduled Background Service is stopping");
            await base.StopAsync(cancellationToken);
        }
    }
}
