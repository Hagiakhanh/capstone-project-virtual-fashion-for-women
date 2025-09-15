using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class ProductService : IProductService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IProductRepository _productRepository;

        public ProductService(IUnitOfWork unitOfWork, IProductRepository productRepository)
        {
            _unitOfWork = unitOfWork;
            _productRepository = productRepository;
        }

        public static string GenerateFixedLengthString(int length)
        {
            using (var sha = System.Security.Cryptography.SHA256.Create())
            {
                var hash = sha.ComputeHash(Guid.NewGuid().ToByteArray());
                string baseStr = Convert.ToBase64String(hash)
                                  .Replace("=", "")
                                  .Replace("+", "")
                                  .Replace("/", "");
                string result = baseStr.Substring(0, Math.Min(length, baseStr.Length));
                return result + "-";
            }
        }


    }
}
