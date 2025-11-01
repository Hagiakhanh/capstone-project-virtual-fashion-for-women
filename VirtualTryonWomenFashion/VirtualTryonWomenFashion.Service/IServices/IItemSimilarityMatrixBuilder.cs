namespace VirtualTryonWomenFashion.Service.IServices;

public interface IItemSimilarityMatrixBuilder
{
    Task BuildAndCacheAsync(CancellationToken cancellationToken = default);
    Dictionary<string, Dictionary<string, double>> GetCachedMatrix();
    Task<Dictionary<string, Dictionary<string, double>>> GetCachedMatrixAsync();
    Task InvalidateCacheAsync();
    //bool IsCacheValid();
    void InvalidateCache();
}