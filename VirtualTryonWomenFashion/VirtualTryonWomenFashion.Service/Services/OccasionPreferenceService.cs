using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.Helpers.CloudinaryConfig;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class OccasionPreferenceService : IOccasionPreferenceService
    {
        private readonly IOccasionPreferenceRepository _occasionPreferenceRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICloudinaryService _cloudinaryService;
        public OccasionPreferenceService(IOccasionPreferenceRepository occasionPreferenceRepository, IUnitOfWork unitOfWork, ICloudinaryService cloudinaryService)
        {
            _occasionPreferenceRepository = occasionPreferenceRepository;
            _unitOfWork = unitOfWork;
            _cloudinaryService = cloudinaryService;
        }

        public async Task<MessageModelWithData<OccasionPreference>> CreateAsync(string name, IFormFile imageFile)
        {
            try
            {
                OccasionPreference occasionPreferenceCreate = new OccasionPreference { OccasionPreferenceName = name };
                string imageUrl = await _cloudinaryService.UploadImageAsync(imageFile);
                occasionPreferenceCreate.ImageUrl = imageUrl;
                await _occasionPreferenceRepository.InsertAsync(occasionPreferenceCreate);
                await _unitOfWork.SaveChanges();
                return new MessageModelWithData<OccasionPreference>()
                {
                    Data = occasionPreferenceCreate,
                    Message = "Tạo mục đích cá nhân thành công",
                    StatusCode = StatusCodes.Status201Created,
                };
            }
            catch (Exception ex)
            {
                return new MessageModelWithData<OccasionPreference>()
                {
                    Data = null,
                    Message = "Tạo mục đích cá nhân thất bại",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        public async Task<List<OccasionPreference>> GetAllAsync()
        {
            return await _occasionPreferenceRepository.GetAll();
        }
    }
}
