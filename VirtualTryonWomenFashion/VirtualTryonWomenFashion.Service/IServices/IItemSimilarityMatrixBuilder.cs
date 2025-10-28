namespace VirtualTryonWomenFashion.Service.IServices;

public interface IItemSimilarityMatrixBuilder
{
    Task BuildAndCacheAsync(CancellationToken cancellationToken = default);
    Dictionary<string, Dictionary<string, double>> GetCachedMatrix();
    bool IsCacheValid();
    void InvalidateCache();
}