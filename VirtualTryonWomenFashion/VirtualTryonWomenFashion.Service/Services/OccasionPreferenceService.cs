using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
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

        public Task<MessageModelWithData<OccasionPreference>> CreateAsync(string name, IFormFile imageFile)
        {
            throw new NotImplementedException();
        }

        public async Task<List<OccasionPreference>> GetAllAsync()
        {
            return await _occasionPreferenceRepository.GetAll();
        }
    }
}
