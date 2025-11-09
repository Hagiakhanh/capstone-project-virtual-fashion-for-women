using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.SaleCampaign;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface ISaleCampaignService
    {
        public Task<ResponsePaginationModel<List<ResponseGetShortSaleCampaignDetail>>> GetAllSaleCampaign(PaginationParameter paginationParameter);
        public Task<MessageModel> CreateSaleCampaign(RequestCreateSaleCampaign model);
        public Task<MessageModelWithData<ResponseGetSaleCampaign>> UpdateSaleCampaign(int campaignId, RequestUpdateSaleCampaign model);
        public Task<MessageModel> DeleteSaleCampaign(int saleCampaignID);
        public Task<MessageModelWithData<ResponseGetSaleCampaign>> GetDetailSaleCampaign(int saleCampaignID);
        public Task ChangeStatusForExistingSaleCampaign();

        public Task<ResponseSaleCampaignStatistic> GetStatisticBySaleCampaignID(int saleCampaignID, DateOnly? startDate = null, DateOnly? endDate = null);

    }
}
