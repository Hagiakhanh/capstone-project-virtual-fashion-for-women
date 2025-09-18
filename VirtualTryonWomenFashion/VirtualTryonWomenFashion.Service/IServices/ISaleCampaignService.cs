using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.SaleCampaign;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface ISaleCampaignService
    {
        public Task<ResponsePaginationModel<SaleCampaign>> GetAllSaleCampaign(PaginationParameter paginationParameter);
        public Task<MessageModel> CreateSaleCampaign(RequestCreateSaleCampaign model);
        public Task<MessageModelWithData<ResponseGetSaleCampaign>> UpdateSaleCampaign(SaleCampaign model);
        public Task<MessageModel> DeleteSaleCampaign(int saleCampaignID);
        public Task<SaleCampaign> GetDetailSaleCampaign(int saleCampaignID);
    }
}
