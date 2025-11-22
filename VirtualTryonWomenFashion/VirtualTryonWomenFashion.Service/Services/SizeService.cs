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
                bool isExisted = _sizeRepository.Count(x => x.SizeCode.ToLower() == sizeModel.SizeCode.Trim().ToLower()) > 0;
                if (isExisted)
                {
                    return new MessageModelWithData<Size>
                    {
                        Message = "Tạo thất bại: Mã kích cỡ đã tồn tại",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

                var model = new Size
                {
                    SizeCode = sizeModel.SizeCode.Trim()
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

        public async Task<MessageModelWithData<Size>> UpdateAsync(int sizeId, RequestCreateSizeModel sizeModel)
        {
            try
            {
                var existedSize = await _sizeRepository.GetByIdAsync(sizeId);
                
                if (existedSize == null)
                {
                    return new MessageModelWithData<Size>
                    {
                        Message = "Không tìm thấy size",
                        StatusCode = StatusCodes.Status404NotFound
                    };
                }
                // 1️⃣ Kiểm tra trùng mã size
                bool isExisted = _sizeRepository.Count(x => x.SizeCode.ToLower() == sizeModel.SizeCode.Trim().ToLower()) > 0;
                if (isExisted)
                {
                    return new MessageModelWithData<Size>
                    {
                        Message = "Tạo thất bại: Mã kích cỡ đã tồn tại",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

                existedSize.SizeCode = sizeModel.SizeCode;

                await _sizeRepository.UpdateAsync(existedSize);
                int result = await _unitOfWork.SaveChanges();

                if (result > 0)
                {
                    return new MessageModelWithData<Size>
                    {
                        Message = "Cập nhật thành công kích cỡ mới",
                        StatusCode = StatusCodes.Status200OK,
                        Data = existedSize
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

        public async Task<Size> GetByidAsync(int id)
        {
            try
            {
                var size = await _sizeRepository.GetByIdAsync(id);
                if (size == null)
                {
                    throw new ArgumentNullException("Not found");
                }

                return size;
            }
            catch (Exception ex)
            {
                throw new Exception("Fail");
            }
        }

        public async Task<MessageModel> DeleteSize(int sizeId)
        {
            try
            {
                var size = await _sizeRepository.GetSizeById(sizeId);
                if (size == null)
                {
                    return new MessageModel
                    {
                        Message = "Không tìm thấy size",
                        StatusCode = StatusCodes.Status404NotFound
                    };
                }

                bool isUsed = size.ProductVariants != null && size.ProductVariants.Any();
                if (isUsed)
                {
                    return new MessageModel
                    {
                        Message = "Không thể xóa size vì đang được sử dụng trong sản phẩm",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

                await _sizeRepository.Delete(size);

                var result = await _unitOfWork.SaveChanges();
                if (result > 0)
                {
                    return new MessageModel
                    {
                        Message = "Xóa thành công size",
                        StatusCode = StatusCodes.Status200OK
                    };
                }
                else
                {
                    return new MessageModel
                    {
                        Message = "Xóa thất bại",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }
            }
            catch
            {
                return new MessageModel
                {
                    Message = "Xóa thất bại: Lỗi hệ thống",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

    }
}
