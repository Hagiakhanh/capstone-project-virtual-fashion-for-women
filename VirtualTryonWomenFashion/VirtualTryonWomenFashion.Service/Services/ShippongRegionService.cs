using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class ShippongRegionService : IShippingRegionService
    {
        private readonly IShippingRegionRespository _shippingRegionRespository;
        private readonly IUnitOfWork _unitOfWork;
        public ShippongRegionService(IShippingRegionRespository shippingRegionRespository, IUnitOfWork unitOfWork)
        {
            _shippingRegionRespository = shippingRegionRespository;
            _unitOfWork = unitOfWork;
        }
        public async Task<List<ShippingRegion>> GetShippingRegionAsync()
        {
            return await _shippingRegionRespository.GetShippingRegion();
        }

        public async Task<bool> UpdateShippingRegionAsync(List<ShippingRegion> shippingRegionsRequest)
        {
            await _unitOfWork.BeginTransactionAsync();
            try
            {
                var shippingRegions = await _shippingRegionRespository.GetShippingRegion();
                foreach (var item in shippingRegions)
                {
                    item.BasePrice = shippingRegionsRequest.Where(req => req.ShippingRegionId == item.ShippingRegionId).FirstOrDefault().BasePrice;
                    item.AdditionalWeightFee = shippingRegionsRequest.Where(req => req.ShippingRegionId == item.ShippingRegionId).FirstOrDefault().AdditionalWeightFee;
                }
                await _shippingRegionRespository.UpdateRangeAsync(shippingRegions);
                await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();
                return true;
            }catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw ex;
            }
        }
    }
}
