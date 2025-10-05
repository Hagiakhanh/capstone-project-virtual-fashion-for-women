namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IGeminiService
    {
        Task<float[]> GetEmbeddingAsync(string text);
        Task<string> CallGeminiAsync(string prompt);
    }
}
