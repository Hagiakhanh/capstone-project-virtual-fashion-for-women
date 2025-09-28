using Microsoft.Extensions.Configuration;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class PineconeService : IVectorDbService
    {
        private readonly HttpClient _http;
        private readonly string _apiKey, _indexUrl;

        public PineconeService(IConfiguration config, HttpClient http)
        {
            _http = http;
            _apiKey = config["Pinecone:ApiKey"]!;
            _indexUrl = config["Pinecone:IndexUrl"]!;
        }

        public async Task UpsertAsync(string id, float[] vector, IDictionary<string, string> metadata)
        {
            // 1. Chuẩn bị payload
            var body = new
            {
                vectors = new[]
                {
            new
            {
                id,
                values   = vector,
                metadata = metadata
            }
        }
            };

            // 2. Serialize để in log
            var jsonBody = JsonSerializer.Serialize(body);
            Console.WriteLine("Pinecone Upsert URL: " + _indexUrl + "/vectors/upsert");
            Console.WriteLine("Pinecone Upsert payload: " + jsonBody);

            // 3. Build request
            using var req = new HttpRequestMessage(HttpMethod.Post, $"{_indexUrl}/vectors/upsert")
            {
                Content = new StringContent(jsonBody, Encoding.UTF8, "application/json")
            };
            req.Headers.Add("Api-Key", _apiKey);

            // 4. Gửi và nhận response
            var resp = await _http.SendAsync(req);
            var respBody = await resp.Content.ReadAsStringAsync();

            // 5. Log status + body
            Console.WriteLine($"Pinecone response status: {(int)resp.StatusCode}");
            Console.WriteLine("Pinecone response body: " + respBody);

            // 6. Ném nếu lỗi
            resp.EnsureSuccessStatusCode();
        }


        public async Task<IReadOnlyList<(string, IDictionary<string, string>, float)>> QueryAsync(float[] vector, int topK)
        {
            var payload = new { vector, topK, includeMetadata = true }; // Đảm bảo yêu cầu có metadata
            using var req = new HttpRequestMessage(HttpMethod.Post,
                $"{_indexUrl}/query")
            { Content = JsonContent.Create(payload) };
            req.Headers.Add("Api-Key", _apiKey);
            var resp = await _http.SendAsync(req);
            resp.EnsureSuccessStatusCode();

            var doc = await resp.Content.ReadFromJsonAsync<JsonElement>();

            // Kiểm tra xem có thuộc tính "matches" không trước khi dùng
            if (!doc.TryGetProperty("matches", out var matchesElement))
            {
                return new List<(string, IDictionary<string, string>, float)>(); // Trả về danh sách rỗng nếu không có matches
            }

            var list = new List<(string, IDictionary<string, string>, float)>();
            foreach (var m in matchesElement.EnumerateArray())
            {
                // === SỬA LỖI Ở ĐÂY: SỬ DỤNG TryGetProperty CHO MỌI TRƯỜNG ===

                // Lấy 'id' một cách an toàn
                if (!m.TryGetProperty("id", out var idElement) || idElement.GetString() == null)
                {
                    continue; // Bỏ qua kết quả này nếu không có ID
                }
                string id = idElement.GetString()!;

                // Lấy 'score' một cách an toàn
                float score = m.TryGetProperty("score", out var scoreElement) ? scoreElement.GetSingle() : 0.0f;

                // Lấy 'metadata' một cách an toàn
                var meta = new Dictionary<string, string>();
                if (m.TryGetProperty("metadata", out var metadataElement))
                {
                    meta = metadataElement.EnumerateObject()
                                          .ToDictionary(p => p.Name, p => p.Value.GetString() ?? string.Empty);
                }

                list.Add((id, meta, score));
            }
            return list;
        }

        public async Task<VectorDatabaseRecord?> GetByIdAsync(string id)
        {
            // 0. Kiểm tra đầu vào
            if (string.IsNullOrEmpty(id))
            {
                return null;
            }

            // 1. Chuẩn bị URL với query parameter 'ids'
            var fetchUrl = $"{_indexUrl}/vectors/fetch?ids={id}";

            // 2. Log URL
            Console.WriteLine("Pinecone Fetch URL: " + fetchUrl);

            // 3. Build request (sử dụng GET)
            using var req = new HttpRequestMessage(HttpMethod.Get, fetchUrl);
            req.Headers.Add("Api-Key", _apiKey);

            // 4. Gửi và nhận response
            var resp = await _http.SendAsync(req);
            var respBody = await resp.Content.ReadAsStringAsync();

            // 5. Log status + body
            Console.WriteLine($"Pinecone response status: {(int)resp.StatusCode}");
            Console.WriteLine("Pinecone response body: " + respBody);

            // 6. Ném nếu lỗi
            resp.EnsureSuccessStatusCode();

            // 7. Phân tích JSON response để lấy dữ liệu
            using var doc = JsonDocument.Parse(respBody);
            var root = doc.RootElement;

            // Phản hồi của Pinecone có cấu trúc: { "vectors": { "id-cua-ban": { ... } } }
            if (root.TryGetProperty("vectors", out var vectors) &&
                vectors.TryGetProperty(id, out var vectorDetails))
            {
                var metadata = new Dictionary<string, string>();
                if (vectorDetails.TryGetProperty("metadata", out var metadataElement))
                {
                    metadata = metadataElement.EnumerateObject()
                                              .ToDictionary(p => p.Name, p => p.Value.GetString()!);
                }

                // Trả về đối tượng VectorData đã được định nghĩa
                return new VectorDatabaseRecord(id, metadata);
            }

            // Trả về null nếu không tìm thấy vector với ID tương ứng
            return null;
        }

        public async Task<IReadOnlyList<(string id, IDictionary<string, string> metadata, float score)>> QueryAsync(
    float[] vector,
    int topK,
    IDictionary<string, object>? filters = null) // 1. THÊM THAM SỐ FILTERS
        {
            var payload = new Dictionary<string, object>
    {
        { "vector", vector },
        { "topK", topK },
        { "includeMetadata", true }
    };

            // Chỉ thêm mục 'filter' vào payload nếu nó được cung cấp và không rỗng
            if (filters != null && filters.Count > 0)
            {
                payload.Add("filter", filters);
            }

            // 3. THÊM LOGGING ĐỂ DỄ DÀNG GỠ LỖI CẤU TRÚC FILTER
            var jsonPayload = System.Text.Json.JsonSerializer.Serialize(payload);
            Console.WriteLine("Pinecone Query payload: " + jsonPayload);

            using var req = new HttpRequestMessage(HttpMethod.Post, $"{_indexUrl}/query")
            {
                // Dùng StringContent để đảm bảo JSON được serialize đúng
                Content = new StringContent(jsonPayload, System.Text.Encoding.UTF8, "application/json")
            };

            req.Headers.Add("Api-Key", _apiKey);
            var resp = await _http.SendAsync(req);
            resp.EnsureSuccessStatusCode();

            var doc = await resp.Content.ReadFromJsonAsync<JsonElement>();

            // Phần logic parse JSON phía sau giữ nguyên vì đã rất tốt rồi
            if (!doc.TryGetProperty("matches", out var matchesElement))
            {
                return new List<(string, IDictionary<string, string>, float)>();
            }

            var list = new List<(string, IDictionary<string, string>, float)>();
            foreach (var m in matchesElement.EnumerateArray())
            {
                if (!m.TryGetProperty("id", out var idElement) || idElement.GetString() == null) continue;
                string id = idElement.GetString()!;
                float score = m.TryGetProperty("score", out var scoreElement) ? scoreElement.GetSingle() : 0.0f;
                var meta = new Dictionary<string, string>();
                if (m.TryGetProperty("metadata", out var metadataElement))
                {
                    meta = metadataElement.EnumerateObject()
                        .ToDictionary(p => p.Name, p => p.Value.GetString() ?? string.Empty);
                }
                list.Add((id, meta, score));
            }
            return list;
        }
    }
}
