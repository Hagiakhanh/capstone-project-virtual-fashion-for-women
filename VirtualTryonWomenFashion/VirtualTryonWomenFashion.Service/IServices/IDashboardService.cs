using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.Repositories;
using VirtualTryonWomenFashion.Service.DTO.DashBoard;

namespace VirtualTryonWomenFashion.Service.IServices;

public interface IDashboardService
{
    Task<ResponseBasicSystemIndicator> GetBasicSystemIndicators();
    Task<List<RevenueResult>> GetRevenueAsync(RevenueFilterRequest filter);
    Task<List<CategorySalesPieDto>> GetCategorySalesPieAsync(string timeFilterType);
    Task<List<TopTryOnProductDto>> GetTopTryOnProductsAsync(
        DateTime? start, DateTime? end, int limit);
    Task<List<TryOnChartPointDto>> GetTryOnTimelineAsync(
        string productId, DateTime? start, DateTime? end);
    Task<AiDashboardStatsDto> GetAIDashboardStatsAsync();
    Task<List<AiConversationChartDto>> GetConversationChartAsync(DateTime startDate, DateTime endDate);
    Task<List<TopSuggestedProductResponse>> GetTopSuggestedProductsAsync(
        DateTime start,
        DateTime end,
        int top);
}