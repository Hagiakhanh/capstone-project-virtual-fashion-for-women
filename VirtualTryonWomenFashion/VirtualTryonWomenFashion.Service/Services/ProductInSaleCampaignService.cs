using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.ProductInSaleCampaign;
using VirtualTryonWomenFashion.Service.Helpers;
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

        public async Task<MessageModelWithData<ResponseCheckedProductInSaleCampaign>> CheckListProductIdInSaleCampaign(
      DateOnly startDate,
      DateOnly endDate,
      List<string> listProductID)
        {
            try
            {
                HashSet<string> hashSetProductId = listProductID.ToHashSet();
                List<string> validListProductId = new List<string>();

                List<ProductInSaleCampaign> productInCampaigns = await _repository.GetAll(
                    null,
                    filter: x => hashSetProductId.Contains(x.ProductId) && x.Campaign.IsDeleted == false && x.Campaign.Status != SaleCampaignStatusEnum.Expired.ToString() && x.Product.IsDeleted == false,
                    includes: [x => x.Campaign, x => x.Product]
                );

                List<string> invalidProducts = productInCampaigns
                    .GroupBy(p => p.ProductId)
                    .Where(g =>
                        g.Any(p =>
                            p.Campaign.StartDate <= endDate &&
                            startDate <= p.Campaign.EndDate
                        )
                    )
                    .Select(g => g.Key)
                    .ToList();

                foreach (var productId in hashSetProductId)
                {
                    if (!invalidProducts.Contains(productId))
                    {
                        validListProductId.Add(productId);
                    }
                }

                return new MessageModelWithData<ResponseCheckedProductInSaleCampaign>()
                {
                    Message = "Đã kiểm tra thành công các sản phẩm trong chiến dịch",
                    StatusCode = StatusCodes.Status200OK,
                    Data = new ResponseCheckedProductInSaleCampaign()
                    {
                        ValidProductIDList = validListProductId,
                        InvalidProductIDList = invalidProducts
                    }
                };
            }
            catch (Exception)
            {
                return new MessageModelWithData<ResponseCheckedProductInSaleCampaign>()
                {
                    Message = "Kiểm tra thất bại các sản phẩm có hợp lệ cho chiến dịch",
                    StatusCode = StatusCodes.Status500InternalServerError,
                    Data = new ResponseCheckedProductInSaleCampaign()
                };
            }
        }

        public async Task<bool> InsertListProductInSaleCampaign(List<ProductInSaleCampaign> listProductInSaleCampaign)
        {
            try
            {
                await _repository.AddRangeAsync(listProductInSaleCampaign);
                return true;
            }
            catch (Exception e)
            {
                return false;
            }

        }
    }
}
