using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.DBContext;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;

namespace VirtualTryonWomenFashion.Data.Repositories
{
    public class ProductInSaleCampaignRepository : GenericRepository<ProductInSaleCampaign>, IProductInSaleCampaignRepository
    {
        public ProductInSaleCampaignRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }
    }
}
