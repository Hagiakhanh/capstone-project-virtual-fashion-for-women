using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.Size;
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
        public async Task<MessageModelWithData<Size>> CreateAsync(RequestCreateSizeModel sizeModel)
        {
            try
            {
                // 1️⃣ Kiểm tra trùng mã size
                bool isExisted = _sizeRepository.Count(x => x.SizeCode.ToLower() == sizeModel.SizeCode.ToLower()) > 0;
                if (isExisted)
                {
                    return new MessageModelWithData<Size>
                    {
                        Message = "Tạo thất bại: Mã kích cỡ đã tồn tại",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

                // 2️⃣ Lấy toàn bộ size hiện có để kiểm tra overlap
                var existingSizes = await _sizeRepository.GetAll();

                foreach (var s in existingSizes)
                {
                    bool heightOverlap = !(sizeModel.MaxHeight < s.MinHeight || sizeModel.MinHeight > s.MaxHeight);
                    bool bustOverlap = !(sizeModel.MaxBust < s.MinBust || sizeModel.MinBust > s.MaxBust);
                    bool waistOverlap = !(sizeModel.MaxWaist < s.MinWaist || sizeModel.MinWaist > s.MaxWaist);
                    bool hipsOverlap = !(sizeModel.MaxHips < s.MinHips || sizeModel.MinHips > s.MaxHips);

                    // Nếu có bất kỳ vùng nào overlap
                    if (heightOverlap && bustOverlap && waistOverlap && hipsOverlap)
                    {
                        return new MessageModelWithData<Size>
                        {
                            Message = $"Tạo thất bại: Phạm vi kích cỡ bị chồng lấn với size {s.SizeCode}",
                            StatusCode = StatusCodes.Status400BadRequest
                        };
                    }
                }

                var model = new Size
                {
                    SizeCode = sizeModel.SizeCode,
                    MinHeight = sizeModel.MinHeight,
                    MaxHeight = sizeModel.MaxHeight,
                    MinBust = sizeModel.MinBust,
                    MaxBust = sizeModel.MaxBust,
                    MinWaist = sizeModel.MinWaist,
                    MaxWaist = sizeModel.MaxWaist,
                    MinHips = sizeModel.MinHips,
                    MaxHips = sizeModel.MaxHips
                };

                await _sizeRepository.InsertAsync(model);
                int result = await _unitOfWork.SaveChanges();

                if (result > 0)
                {
                    return new MessageModelWithData<Size>
                    {
                        Message = "Tạo thành công kích cỡ mới",
                        StatusCode = StatusCodes.Status201Created,
                        Data = model
                    };
                }

                return new MessageModelWithData<Size>
                {
                    Message = "Tạo thất bại: Không lưu được dữ liệu",
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
