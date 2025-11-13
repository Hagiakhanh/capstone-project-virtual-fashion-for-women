using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Service.DTO.DashBoard;

namespace VirtualTryonWomenFashion.Service.IServices;

public interface IDashboardService
{
    Task<ResponseSystemStatistic> GetSystemWideStatistic(
        DateOnly? startDate,
        DateOnly? endDate,
        StatisticGroupingEnum? grouping);
}