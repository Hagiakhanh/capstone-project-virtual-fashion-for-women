using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
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

        public async Task<List<ProductInSaleCampaign>> GetDetailProductInSaleCampaign(int campaignID)
        {
            var productInSaleCampaigns = await _context.ProductInSaleCampaigns
                .Where(x => x.CampaignId == campaignID
                         && x.Product.ProductColors.Any(pc => pc.ProductVariants.Any()))
                .Include(x => x.Product)
                    .ThenInclude(p => p.ProductColors.Where(pc => pc.ProductVariants.Any()))
                        .ThenInclude(pc => pc.ProductVariants)
                .Include(x => x.Product)
                    .ThenInclude(p => p.ProductColors)
                        .ThenInclude(pc => pc.ProductImages)
                .Include(x => x.Product).ThenInclude(p => p.Category)
                .ToListAsync();

            return productInSaleCampaigns;
        }

        public async Task<List<ProductInSaleCampaign>> GetDetailProductInSaleCampaignPagination(
     int campaignID,
     PaginationParameter paginationParameter)
        {
            var query = _context.ProductInSaleCampaigns
                .Where(x => x.CampaignId == campaignID
                         && x.Product.ProductColors.Any(pc => pc.ProductVariants.Any()))
                .Include(x => x.Product)
                    .ThenInclude(p => p.ProductColors.Where(pc => pc.ProductVariants.Any()))
                        .ThenInclude(pc => pc.ProductVariants)
                .Include(x => x.Product)
                    .ThenInclude(p => p.ProductColors)
                        .ThenInclude(pc => pc.ProductImages)
                .Include(x => x.Product)
                    .ThenInclude(p => p.Category);

            var result = await query
                .OrderBy(x => x.SalePrice)
                .Skip(paginationParameter.PageIndex * paginationParameter.PageSize)
                .Take(paginationParameter.PageSize)
                .ToListAsync();

            return result;
        }
    }
}
