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
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class SizeService : ISizeService
    {
        private readonly ISizeRepository _sizeRepository;
        private readonly IUnitOfWork _unitOfWork;
        public SizeService(ISizeRepository sizeRepository, IUnitOfWork unitOfWork)
        {
            _sizeRepository = sizeRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task<MessageModelWithData<Size>> CreateAsync(string sizeName)
        {
            try
            {
                bool isExisted = _sizeRepository.Count(x => x.SizeCode.ToLower() == sizeName.ToLower()) > 0 ? true : false;
                if (!isExisted)
                {
                    Size model = new Size()
                    {
                        SizeCode = sizeName,
                    };
                    await _sizeRepository.InsertAsync(model);
                    int result = await _unitOfWork.SaveChanges();
                    if (result > 0)
                    {
                        return new MessageModelWithData<Size>
                        {
                            Message = "Tạo thành công kích cỡ mới",
                            StatusCode = StatusCodes.Status201Created,
                            Data= model
                        };
                    }
                }
                return new MessageModelWithData<Size>
                {
                    Message = "Tạo thất bại: Kích cỡ nhập vào đã tồn tại",
                    StatusCode = StatusCodes.Status400BadRequest

                };
            }
            catch (Exception ex)
            {
                return new MessageModelWithData<Size>
                {
                    Message = "Tạo thất bại: Lỗi hệ thống",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }

        }

        public async Task<List<Size>> GetAllAsync()
        {
            return await _sizeRepository.GetAll();
        }
    }
}
