using Microsoft.AspNetCore.Http;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IGeminiService
    {
        Task<float[]> GetEmbeddingAsync(string text);
        Task<string> CallGeminiAsync(string prompt);
        public Task<string> CallGeminiWithMediaAsync(string prompt, IFormFile mediaFile);
    }
}
