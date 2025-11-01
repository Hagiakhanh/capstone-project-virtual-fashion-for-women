using Microsoft.Extensions.Caching.Distributed;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class RedisCacheService : IRedisCacheService
    {
        private readonly IDistributedCache _cache;
        
        // ✅ 2. Tạo một cấu hình (options) static cho Serializer
        private static readonly JsonSerializerOptions _serializerOptions = new()
        {
            // ✅ 3. Bật chế độ xử lý tham chiếu vòng
            ReferenceHandler = ReferenceHandler.Preserve
        };

        public RedisCacheService(IDistributedCache cache)
        {
            _cache = cache;
        }

        public async Task<T?> GetData<T>(string key)
        {
            var data = await _cache.GetStringAsync(key);
            if (data == null)
            {
                return default(T?);
            }
            return JsonSerializer.Deserialize<T>(data, _serializerOptions);
        }

        public async Task SetData<T>(string key, T value, TimeSpan? expiryTime)
        {
            var option = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiryTime
            };
            await _cache?.SetStringAsync(key, JsonSerializer.Serialize(value, _serializerOptions), option);
        }
        
        public async Task RemoveData(string key)
        {
            await _cache.RemoveAsync(key);
        }
    }
}
