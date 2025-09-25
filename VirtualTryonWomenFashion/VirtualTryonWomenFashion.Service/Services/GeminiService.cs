using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class GeminiService : IGeminiService
    {
        private readonly HttpClient _http;
        private readonly string _apiKey;

        public GeminiService(IConfiguration config, HttpClient http)
        {
            _http = http;
            _apiKey = config["GeminiApiKey"]!;
        }

        public async Task<float[]> GetEmbeddingAsync(string text)
        {
            // Build payload for embedContent
            var payload = new
            {
                model = "models/gemini-embedding-exp-03-07",
                content = new
                {
                    parts = new[] { new { text = text } }
                }
            };
            var jsonPayload = JsonSerializer.Serialize(payload);
            var request = new HttpRequestMessage(HttpMethod.Post,
                $"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-exp-03-07:embedContent?key={_apiKey}")
            {
                Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json")
            };

            // Send request
            var response = await _http.SendAsync(request);
            var body = await response.Content.ReadAsStringAsync();
            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Embedding failed ({(int)response.StatusCode}): {body}");
            }

            using var doc = JsonDocument.Parse(body);
            var valuesProp = doc.RootElement
                                .GetProperty("embedding")
                                .GetProperty("values");
            var embArray = valuesProp.EnumerateArray()
                                     .Select(e => e.GetSingle())
                                     .ToArray();
            return embArray;
        }
        public async Task<string> CallGeminiAsync(string prompt)
        {
            var apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={_apiKey}";
            var payload = new { contents = new[] { new { parts = new[] { new { text = prompt } } } } };

            var response = await _http.PostAsJsonAsync(apiUrl, payload);
            response.EnsureSuccessStatusCode();

            var responseElement = await response.Content.ReadFromJsonAsync<JsonElement>();
            return responseElement.GetProperty("candidates")[0].GetProperty("content").GetProperty("parts")[0].GetProperty("text").GetString() ?? "";
        }

    }
}
