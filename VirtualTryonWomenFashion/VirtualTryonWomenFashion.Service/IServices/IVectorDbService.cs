namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IVectorDbService
    {
        Task UpsertAsync(string id, float[] vector, IDictionary<string, string> metadata);
        Task<IReadOnlyList<(string Id, IDictionary<string, string> Metadata, float Score)>> QueryAsync(float[] vector, int topK);
        Task<VectorDatabaseRecord> GetByIdAsync(string id);
        public Task<IReadOnlyList<(string id, IDictionary<string, string> metadata, float score)>> QueryAsync(
    float[] vector,
    int topK,
    IDictionary<string, object>? filters = null);
    }
    public record VectorDatabaseRecord(string Id, IDictionary<string, string> Metadata);
}
