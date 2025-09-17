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
    public class ProductInSaleCampaignService : IProductInSaleCampaignService
    {
        private readonly IProductInSaleCampaignRepository _repository;
        private readonly IUnitOfWork _unitOfWork;
        public ProductInSaleCampaignService(IProductInSaleCampaignRepository productInSaleCampaignRepository, IUnitOfWork unitOfWork)
        {
            _repository = productInSaleCampaignRepository;
            _unitOfWork = unitOfWork;
        }
        public Task<List<ProductInSaleCampaign>> CheckListProductVarianceIdInvalid(List<int> listVarianceID)
        {
            try
            {

            }
            catch (Exception ex) { 
            
            }
            throw new NotImplementedException();
        }
    }
}
