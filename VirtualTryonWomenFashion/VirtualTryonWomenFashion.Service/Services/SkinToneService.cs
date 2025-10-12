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
    public class SkinToneService : ISkinToneService
    {
        private readonly ISkinToneRepository _skinToneRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICloudinaryService _cloudinaryService;
        public SkinToneService(ISkinToneRepository skinToneRepository, IUnitOfWork unitOfWork, ICloudinaryService cloudinaryService)
        {
            _skinToneRepository = skinToneRepository;
            _unitOfWork = unitOfWork;
            _cloudinaryService= cloudinaryService;
        }

        public Task<MessageModelWithData<SkinTone>> CreateAsync(string name, IFormFile imageFile)
        {
            throw new NotImplementedException();
        }

        public async Task<List<SkinTone>> GetAllAsync()
        {
            return await _skinToneRepository.GetAll();
        }
    }
}
