using Microsoft.AspNetCore.Http;
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
        private readonly string _apiKeyChatBot;
        private readonly string _apiKeyValidateImage;


        public GeminiService(IConfiguration config, HttpClient http)
        {
            _http = http;
            _apiKeyChatBot = config["Gemini:ChatBotApiKey"]!;
            _apiKeyValidateImage = config["Gemini:ValidateTryOnKey"]!;
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
                $"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-exp-03-07:embedContent?key={_apiKeyChatBot}")
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
            var apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={_apiKeyChatBot}";

            // 1. Cấu hình trả về JSON thuần
            var payload = new
            {
                contents = new[] { new { parts = new[] { new { text = prompt } } } },
                generationConfig = new { responseMimeType = "application/json" }
            };

            int maxRetries = 3;
            int delayMs = 1000; // Khởi đầu chờ 1 giây

            for (int i = 0; i < maxRetries; i++)
            {
                var response = await _http.PostAsJsonAsync(apiUrl, payload);

                if (response.IsSuccessStatusCode)
                {
                    var responseElement = await response.Content.ReadFromJsonAsync<JsonElement>();
                    try
                    {
                        // Lấy text ra, lúc này nó là JSON string sạch
                        return responseElement.GetProperty("candidates")[0]
                                              .GetProperty("content")
                                              .GetProperty("parts")[0]
                                              .GetProperty("text")
                                              .GetString() ?? "";
                    }
                    catch
                    {
                        // Phòng trường hợp cấu trúc trả về khác lạ
                        return "";
                    }
                }

                // 2. Xử lý Rate Limit (429)
                if ((int)response.StatusCode == 429)
                {
                    // Nếu bị limit, chờ rồi thử lại (Exponential Backoff)
                    await Task.Delay(delayMs);
                    delayMs *= 2; // Lần sau chờ lâu gấp đôi (2s -> 4s -> 8s)
                    continue;
                }

                // Nếu lỗi khác (400, 500...), đọc nội dung lỗi để debug
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Exception($"Gemini API Error: {response.StatusCode} - {errorContent}");
            }

            throw new Exception("Quá nhiều request (Rate Limit) dù đã thử lại nhiều lần.");
        }

        public async Task<string> CallGeminiWithMediaAsync(string prompt, IFormFile mediaFile)
        {
            // 1. Đọc IFormFile và chuyển đổi sang Base64
            string base64File;
            string mimeType = mediaFile.ContentType;

            // Xử lý đọc file trong bộ nhớ
            using (var ms = new MemoryStream())
            {
                await mediaFile.CopyToAsync(ms);
                byte[] fileBytes = ms.ToArray();
                base64File = Convert.ToBase64String(fileBytes);
            }

            var apiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={_apiKeyValidateImage}";

            // 2. Định nghĩa cấu trúc contents chứa cả text và dữ liệu Base64
            // Cấu trúc này áp dụng chung cho mọi file đa phương tiện (ảnh, pdf, audio, video)
            var contents = new[]
            {
            new
            {
                parts = new object[]
                {
                    // Part cho file đa phương tiện (dùng inlineData)
                    new
                    {
                        inlineData = new
                        {
                            data = base64File,
                            mimeType = mimeType // MIME type được lấy từ IFormFile
                        }
                    },
                    // Part cho văn bản (prompt)
                    new
                    {
                        text = prompt
                    }
                }
            }
        };

            // 3. Cấu hình payload
            var payload = new
            {
                contents = contents,
                // Yêu cầu trả về JSON thuần
                generationConfig = new { responseMimeType = "application/json" }
            };

            // --- Logic gọi API với Retry (Exponential Backoff) ---
            int maxRetries = 3;
            int delayMs = 1000;

            for (int i = 0; i < maxRetries; i++)
            {
                var response = await _http.PostAsJsonAsync(apiUrl, payload);

                if (response.IsSuccessStatusCode)
                {
                    // Phân tích phản hồi để lấy chuỗi JSON đã được tạo
                    var responseElement = await response.Content.ReadFromJsonAsync<JsonElement>();
                    try
                    {
                        // Trích xuất chuỗi JSON sạch từ trường 'text'
                        return responseElement.GetProperty("candidates")[0]
                                              .GetProperty("content")
                                              .GetProperty("parts")[0]
                                              .GetProperty("text")
                                              .GetString() ?? "";
                    }
                    catch
                    {
                        // Xử lý trường hợp không thể parse cấu trúc phản hồi
                        return string.Empty;
                    }
                }

                // Xử lý Rate Limit (HTTP 429)
                if ((int)response.StatusCode == 429)
                {
                    await Task.Delay(delayMs);
                    delayMs *= 2;
                    continue;
                }

                // Xử lý các lỗi HTTP khác
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Exception($"Gemini API Error: {response.StatusCode} - {errorContent}");
            }

            throw new Exception("Quá nhiều request (Rate Limit) dù đã thử lại nhiều lần.");
        }
    }
}
