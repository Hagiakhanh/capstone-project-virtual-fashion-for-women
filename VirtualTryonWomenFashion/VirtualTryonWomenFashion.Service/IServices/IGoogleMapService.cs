using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IGoogleMapService
    {
        public Task<Dictionary<string,string>> GetAutoCompleteLocation(string address);
        public Task<object> GetPlaceDetail(string placeId);
    }
    
}
