using AutoMapper;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.ProductInSaleCampaign;
using VirtualTryonWomenFashion.Service.DTO.SaleCampaign;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Mappers;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class ProductInSaleCampaignService : IProductInSaleCampaignService
    {
        private readonly IProductInSaleCampaignRepository _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public ProductInSaleCampaignService(IProductInSaleCampaignRepository productInSaleCampaignRepository, IUnitOfWork unitOfWork, IMapper mapper)
        {
            _repository = productInSaleCampaignRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;

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

        public async Task<List<ResponseGetProductInSaleCampaign>> GetListProductBasedCampaignID(int campaignID)
        {
            try
            {
                List<ProductInSaleCampaign> listProductInCampaign = await _repository.GetDetailProductInSaleCampaign(campaignID);
                List<ResponseGetProductInSaleCampaign> listMapped = new();
                foreach (var product in listProductInCampaign)
                {
                    ResponseGetProductInSaleCampaign mappedModel = product.MapToResponseGetProductInSaleCampaign();
                    listMapped.Add(mappedModel);
                }
                return listMapped;
            }
            catch (Exception e)
            {
                return [];
            }
        }

        public async Task<ResponseGetProductInSaleCampaign> GetPriceOfProductInActiveCampaign(string productId)
        {
            try
            {
                List<ResponseGetProductInSaleCampaign> listResult = new();
                List<ProductInSaleCampaign> productInListSaleCampaign = await _repository.GetAll(null, x => x.ProductId.Equals(productId)
                && x.Campaign.Status.Equals(SaleCampaignStatusEnum.Active.ToString()), x => x.OrderBy(x => x.Campaign.StartDate), includes: x => x.Campaign);
                ProductInSaleCampaign selectCurrentCampaign = productInListSaleCampaign.FirstOrDefault();
                if (selectCurrentCampaign != null)
                {
                    ResponseGetProductInSaleCampaign mappedModel = new()
                    {
                        CampaignId = selectCurrentCampaign.CampaignId,
                        ProductId = selectCurrentCampaign.ProductId,
                        CampaignDetail = _mapper.Map<ResponseGetShortSaleCampaignDetail>(selectCurrentCampaign.Campaign),
                        SalePrice = selectCurrentCampaign.SalePrice,
                        PercentDiscount = selectCurrentCampaign.PercentDiscount,
                    };
                    return mappedModel;
                }
                return null;
            }
            catch (
            Exception e)
            {
                return null;
            }
        }
        
        // Đặt hàm này trong cùng service với hàm cũ

        public async Task<Dictionary<string, decimal>> GetPricesOfProductsInActiveCampaignAsync(List<string> productIds)
        {
            if (productIds == null || !productIds.Any())
            {
                return new Dictionary<string, decimal>();
            }

            try
            {
                var allProductsInCampaign = await _repository.GetAll(
                    null, 
                    x => productIds.Contains(x.ProductId) && 
                    x.Campaign.Status.Equals(SaleCampaignStatusEnum.Active.ToString()), 
                    x => x.OrderBy(x => x.Campaign.StartDate), 
                    includes: x => x.Campaign
                );

                if (allProductsInCampaign == null || !allProductsInCampaign.Any())
                {
                    return new Dictionary<string, decimal>();
                }

                var latestCampaignsPerProduct = allProductsInCampaign
                    .GroupBy(x => x.ProductId)
                    .Select(g => g.First())
                    .ToList();

                var resultDictionary = latestCampaignsPerProduct
                    .Where(campaign => campaign.SalePrice.HasValue)
                    .ToDictionary(
                        campaign => campaign.ProductId,
                        campaign => campaign.SalePrice.Value 
                    );
        
                return resultDictionary;
            }
            catch (Exception)
            {
                return new Dictionary<string, decimal>();
            }
        }

        public async Task<List<ResponseGetProductInSaleCampaign>> GetProductInSaleCampaign(string productId)
        {
            try
            {
                List<ResponseGetProductInSaleCampaign> listResult = new();
                List<ProductInSaleCampaign> productInListSaleCampaign = await _repository.GetAll(null, x => x.ProductId.Equals(productId)
                && !x.Campaign.Status.Equals(SaleCampaignStatusEnum.Expired.ToString()), x => x.OrderBy(x => x.Campaign.StartDate), includes: x => x.Campaign);
                foreach (var product in productInListSaleCampaign)
                {
                    ResponseGetProductInSaleCampaign mappedModel = new()
                    {
                        CampaignId = product.CampaignId,
                        ProductId = product.ProductId,
                        CampaignDetail = _mapper.Map<ResponseGetShortSaleCampaignDetail>(product.Campaign),
                        SalePrice = product.SalePrice,
                        PercentDiscount = product.PercentDiscount,
                    };
                    listResult.Add(mappedModel);
                }
                return listResult;
            }
            catch (
            Exception e)
            {
                return null;
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
        public async Task<bool> BulkDeleteProductInCampaign(int campaignID, List<string> listProductID)
        {
            try
            {
                List<ProductInSaleCampaign> listProductInCampaign = await _repository.GetAll(null, x => listProductID.Contains(x.ProductId) && x.CampaignId == campaignID);
                _repository.DeleteRange(listProductInCampaign);
                return true;
            }
            catch (Exception e)
            {
                return false;
            }
        }

        public async Task<ResponsePaginationModel<List<ResponseGetProductInSaleCampaign>>> GetListProductBasedCampaignIDPagination(int campaignId, PaginationParameter paginationParameter)
        {
            try
            {
                List<ResponseGetProductInSaleCampaign> listResult = new();

                List<ProductInSaleCampaign> productInListSaleCampaign =
                    await _repository.GetDetailProductInSaleCampaignPagination(campaignId, paginationParameter);

                foreach (var item in productInListSaleCampaign)
                {
                    ResponseGetProductInSaleCampaign mappedModel = item.MapToResponseGetProductInSaleCampaign();
                    listResult.Add(mappedModel);
                }

                int totalRecords = await _repository.CountAsync(x=>x.CampaignId==campaignId);

                int totalPages = (int)Math.Ceiling((double)totalRecords / paginationParameter.PageSize);

                return new ResponsePaginationModel<List<ResponseGetProductInSaleCampaign>>(
                    statusCode: 200,
                    data: listResult,
                    totalRecords: totalRecords,
                    totalPages: totalPages
                );
            }
            catch (Exception ex)
            {
                return new ResponsePaginationModel<List<ResponseGetProductInSaleCampaign>>(
                    statusCode: 500,
                    data: new List<ResponseGetProductInSaleCampaign>(),
                    message: ex.Message
                );
            }
        }

    }
}
