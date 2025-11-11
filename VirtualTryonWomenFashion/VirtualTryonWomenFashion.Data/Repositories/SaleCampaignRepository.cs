using Microsoft.EntityFrameworkCore;
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
    public class SaleCampaignRepository : GenericRepository<SaleCampaign>, ISaleCampaignRepository
    {
        public SaleCampaignRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }

        public async Task<SaleCampaign> GetDetailSaleCampaignByID(int saleCampaignID)
        {
            return await _context.SaleCampaigns.Where(x => x.CampaignId == saleCampaignID).Include(x => x.ProductInSaleCampaigns).FirstOrDefaultAsync();
        }
    }
}
