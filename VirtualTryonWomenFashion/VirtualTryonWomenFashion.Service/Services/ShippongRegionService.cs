using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class ShippongRegionService : IShippingRegionService
    {
        private readonly IShippingRegionRespository _shippingRegionRespository;
        public ShippongRegionService(IShippingRegionRespository shippingRegionRespository)
        {
            _shippingRegionRespository = shippingRegionRespository;
        }
        public async Task<List<ShippingRegion>> GetShippingRegionAsync()
        {
            return await _shippingRegionRespository.GetShippingRegion();
        }
    }
}
