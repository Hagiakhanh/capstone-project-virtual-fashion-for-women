using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Service.DTO.DashBoard;

namespace VirtualTryonWomenFashion.Service.IServices;

public interface IDashboardService
{
    Task<ResponseBasicSystemIndicator> GetBasicSystemIndicators();
}