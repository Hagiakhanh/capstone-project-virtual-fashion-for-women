using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.SaleCampaign;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class SaleCampaignService : ISaleCampaignService
    {
        private readonly ISaleCampaignRepository _saleCampaignRepository;
        private readonly IUnitOfWork _unitOfWork;
        public SaleCampaignService(ISaleCampaignRepository saleCampaignRepository, IUnitOfWork unitOfWork)
        {
            _saleCampaignRepository = saleCampaignRepository; 
            _unitOfWork = unitOfWork;
        }
        public async Task<MessageModel> CreateSaleCampaign(RequestCreateSaleCampaign model)
        {
            try
            {
                DateHelper.EnsureValidDateRange(model.StartDate.Value,model.EndDate.Value);
                // Goi ham check danh sach cac san pham hien tai co trung voi ben chien dich khac trong cung quang thoi gian hay khong
                return new MessageModel
                {
                    Message = "Tạo thành công chiến dịch giảm giá",
                    StatusCode = StatusCodes.Status201Created,
                };
            }
            catch(ArgumentException agrumentEx)
            {
                return new MessageModel
                {
                    Message = "Tạo thất bại "+agrumentEx.Message,
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
            catch (Exception ex)
            {
                return new MessageModel
                {
                    Message = "Tạo thất bại: Lỗi hệ thống",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        public Task<MessageModel> DeleteSaleCampaign(int saleCampaignID)
        {
            throw new NotImplementedException();
        }

        public Task<ResponsePaginationModel<SaleCampaign>> GetAllSaleCampaign(PaginationParameter paginationParameter)
        {
            throw new NotImplementedException();
        }

        public Task<SaleCampaign> GetDetailSaleCampaign(int saleCampaignID)
        {
            throw new NotImplementedException();
        }

        public Task<MessageModelWithData<ResponseGetSaleCampaign>> UpdateSaleCampaign(SaleCampaign model)
        {
            throw new NotImplementedException();
        }
    }
}
