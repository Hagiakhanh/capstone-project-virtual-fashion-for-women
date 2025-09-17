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
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class ColorService : IColorService
    {
        private readonly IColorRepository _colorRepository;
        private readonly IUnitOfWork _unitOfWork;
        public ColorService(IColorRepository colorRepository, IUnitOfWork unitOfWork)
        {
            _colorRepository = colorRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task<MessageModelWithData<Color>> CreateColor(string colorName, string colorPrefix, string hexCode)
        {
            try
            {
                bool isValidColor = ColorHelper.IsValidColor(hexCode);
                if (!isValidColor)
                {
                    throw new InvalidDataException("Màu nhập vào không đúng định dạng");
                }
                bool isExisted = _colorRepository.Count(x => x.ColorPrefix.ToLower() == colorPrefix.ToLower()) > 0 ? true : false;
                if (isExisted)
                {
                    return new MessageModelWithData<Color>
                    {
                        Message = "Tạo thất bại: màu sắc tạo mới có trùng prefix",
                        StatusCode = StatusCodes.Status400BadRequest

                    };

                }
                Color model = new Color()
                {
                    ColorPrefix = colorPrefix,
                    HexCode = hexCode,
                    ColorName = colorName,
                };
                await _colorRepository.InsertAsync(model);
                int result = await _unitOfWork.SaveChanges();
                if (result > 0)
                {
                    return new MessageModelWithData<Color>
                    {
                        Message = "Tạo thành công màu sắc mới",
                        StatusCode = StatusCodes.Status201Created,
                        Data = model
                    };
                }
                else
                {
                    return new MessageModelWithData<Color>
                    {
                        Message = "Tạo thất bại màu sắc",
                        StatusCode = StatusCodes.Status400BadRequest,
                        Data = model
                    };
                }

            }
            catch (InvalidDataException exInput)
            {
                return new MessageModelWithData<Color>
                {
                    Message = exInput.Message,
                    StatusCode = StatusCodes.Status400BadRequest

                };
            }
            catch (Exception ex)
            {
                return new MessageModelWithData<Color>
                {
                    Message = "Tạo thất bại: Lỗi hệ thống",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        public async Task<List<Color>> GetAllAsync()
        {
            return await _colorRepository.GetAll();
        }
    }
}
