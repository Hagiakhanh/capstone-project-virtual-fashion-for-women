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
    public class StyleTypeService : IStyleTypeService
    {
        private readonly IStyleTypeRepository _styleTypeRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICloudinaryService _cloudinaryService;
        public StyleTypeService(IStyleTypeRepository styleTypeRepository, IUnitOfWork unitOfWork, ICloudinaryService cloudinaryService)
        {
            _styleTypeRepository = styleTypeRepository;
            _unitOfWork = unitOfWork;
            _cloudinaryService = cloudinaryService;
        }

        public Task<MessageModelWithData<StyleType>> CreateAsync(string name, IFormFile imageFile)
        {
            throw new NotImplementedException();
        }

        public async Task<List<StyleType>> GetAllAsync()
        {
            return await _styleTypeRepository.GetAll();
        }
    }
}
