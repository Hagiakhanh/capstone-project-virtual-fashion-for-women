using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;

namespace VirtualTryonWomenFashion.Data.IRepositories
{
    public interface IAiconversationRepository : IGenericRepository<Aiconversation>
    {
        Task<int> GetTotalConversationsAsync();
        Task<int> GetTotalUsersUsedAIAsync();
        Task<List<AiConversationChartDto>> GetConversationChartAsync(DateTime startDate, DateTime endDate);
    }
}
