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
            _cloudinaryService = cloudinaryService;
        }

        public async Task<MessageModelWithData<SkinTone>> CreateAsync(string name, IFormFile imageFile)
        {
            try
            {
                SkinTone skinToneCreate = new SkinTone { SkinToneName = name };
                string imageUrl = await _cloudinaryService.UploadImageAsync(imageFile);
                skinToneCreate.ImageUrl = imageUrl;
                await _skinToneRepository.InsertAsync(skinToneCreate);
                await _unitOfWork.SaveChanges();
                return new MessageModelWithData<SkinTone>()
                {
                    Data = skinToneCreate,
                    Message = "Tạo tông da cá nhân thành công",
                    StatusCode = StatusCodes.Status201Created,
                };
            }
            catch (Exception ex)
            {
                return new MessageModelWithData<SkinTone>()
                {
                    Data = null,
                    Message = "Tạo tông da cá nhân thất bại",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        public async Task<List<SkinTone>> GetAllAsync()
        {
            return await _skinToneRepository.GetAll();
        }
    }
}
