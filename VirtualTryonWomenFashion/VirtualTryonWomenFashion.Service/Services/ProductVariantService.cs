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
    public class ProductVariantService : IProductVariantService
    {
        private readonly IProductVariantRepository _productVariantRepository;
        private readonly IUnitOfWork _unitOfWork;

        public ProductVariantService(
            IProductVariantRepository productVariantRepository, 
            IUnitOfWork unitOfWork)
        {
            _productVariantRepository = productVariantRepository;
            _unitOfWork = unitOfWork;
        }
        
        public Task<ProductVariant?> GetProductVariantById(string id)
        {
            return _productVariantRepository.GetByIdAsync(id);
        }
    }
}
