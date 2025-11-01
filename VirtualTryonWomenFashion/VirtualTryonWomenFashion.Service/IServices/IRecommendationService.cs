using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Product;

namespace VirtualTryonWomenFashion.Service.IServices;

public interface IRecommendationService
{
    Task<List<ResponseProductDto>> GetHybridRecommendationsAsync(int topN = 8);
}