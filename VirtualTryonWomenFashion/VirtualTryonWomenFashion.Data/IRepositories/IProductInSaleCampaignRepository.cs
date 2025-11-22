using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.Models;

namespace VirtualTryonWomenFashion.Data.IRepositories
{
    public interface IProductInSaleCampaignRepository : IGenericRepository<ProductInSaleCampaign>
    {
        public Task<List<ProductInSaleCampaign>> GetDetailProductInSaleCampaign(int campaignID);
        public Task<List<ProductInSaleCampaign>> GetDetailProductInSaleCampaignPagination(int campaignID, PaginationParameter? paginationParameter);
    }
}
