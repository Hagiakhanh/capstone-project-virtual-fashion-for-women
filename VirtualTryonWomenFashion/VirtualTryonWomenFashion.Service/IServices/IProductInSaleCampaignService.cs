using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Product;
using VirtualTryonWomenFashion.Service.DTO.ProductInSaleCampaign;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IProductInSaleCampaignService
    {
        public Task<MessageModelWithData<ResponseCheckedProductInSaleCampaign>> CheckListProductIdInSaleCampaign(
      DateOnly startDate,
      DateOnly endDate,
      List<string> listProductID);
        public Task<bool> InsertListProductInSaleCampaign(List<ProductInSaleCampaign> listProductInSaleCampaign);
        public Task<List<ResponseGetProductInSaleCampaign>> GetListProductBasedCampaignID(int campaignID);
        public Task<List<ResponseGetProductInSaleCampaign>> GetProductInSaleCampaign(string productId);
        public Task<ResponsePaginationModel<List<ResponseGetProductInSaleCampaign>>> GetListProductBasedCampaignIDPagination(int campaignId, PaginationParameter paginationParameter);
        Task<Dictionary<string, decimal>> GetPricesOfProductsInActiveCampaignAsync(List<string> productIds);
        public Task<ResponseGetProductInSaleCampaign> GetPriceOfProductInActiveCampaign(string productId);
        public Task<bool> BulkDeleteProductInCampaign(int campaignID, List<string> listProductID);

    }
}
