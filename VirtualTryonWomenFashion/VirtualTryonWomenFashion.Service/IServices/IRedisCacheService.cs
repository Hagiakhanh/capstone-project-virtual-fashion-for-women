using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IRedisCacheService
    {
        public Task<T?> GetData<T>(string key);
        public Task SetData<T>(string key, T value, TimeSpan? expiryTime);
    }
}
