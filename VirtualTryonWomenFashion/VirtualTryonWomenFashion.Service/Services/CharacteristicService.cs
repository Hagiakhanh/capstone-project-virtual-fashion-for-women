using AutoMapper;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.Characteristic;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class CharacteristicService : ICharacteristicService
    {
        private readonly ICharacteristicRepository _characteristicRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly IMapper _mapper;
        public CharacteristicService(ICharacteristicRepository characteristicRepository, IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper)
        {
            _characteristicRepository = characteristicRepository;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _mapper = mapper;
        }
        public async Task<MessageModelWithData<Characteristic>> CreateCharacteristic(RequestCreateUserCharacteristics requestModel)
        {
            try
            {
                int currentUserId = _currentUserService.GetUserId();
                int existedCharacteristic = _characteristicRepository.Count(x => x.UserId == currentUserId);
                if (existedCharacteristic > 0)
                {
                    return new MessageModelWithData<Characteristic>()
                    {
                        Data = null,
                        Message = "Tạo thất bại - đã tồn tại phong cách thời trang của bạn.",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }
                Characteristic characteristicCreateModel = _mapper.Map<Characteristic>(requestModel);
                characteristicCreateModel.UserId = currentUserId;
                await _characteristicRepository.InsertAsync(characteristicCreateModel);
                await _unitOfWork.SaveChanges();
                return new MessageModelWithData<Characteristic>()
                {
                    Data = characteristicCreateModel,
                    Message = "Tạo thành công phong cách thời trang của cá nhân",
                    StatusCode = StatusCodes.Status201Created
                };
            }
            catch (Exception ex)
            {
                return new MessageModelWithData<Characteristic>()
                {
                    Message = "Tạo phong cách thời trang thất bại",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        public string GetCharacteristicDescription(Characteristic c)
        {
            if (c == null) return string.Empty;

            var parts = new List<string>();

            if (c.Age.HasValue)
                parts.Add($"Tôi {c.Age} tuổi");

            if (c.Height.HasValue)
                parts.Add($"cao khoảng {c.Height} cm");

            if (c.Weight.HasValue)
                parts.Add($"nặng {c.Weight} kg");

            if (!string.IsNullOrWhiteSpace(c.SkinTone))
                parts.Add($"có làn da {c.SkinTone}");

            var sentence = string.Join(", ", parts);
            if (!string.IsNullOrWhiteSpace(sentence))
                sentence = sentence.TrimEnd(',') + ".";

            // Thêm sở thích về màu sắc
            if (!string.IsNullOrWhiteSpace(c.ColorPreference))
                sentence += $" Tôi thích màu {c.ColorPreference}.";

            // Thêm phong cách
            if (!string.IsNullOrWhiteSpace(c.StyleType))
                sentence += $" Phong cách tôi yêu thích là {c.StyleType.ToLower()}.";

            // Thêm dịp
            if (!string.IsNullOrWhiteSpace(c.OccasionPreference))
                sentence += $" Tôi thường chọn trang phục cho dịp {c.OccasionPreference.ToLower()}.";

            return sentence;
        }

        public async Task<Characteristic> GetCurrentCharacteristicForUser()
        {
            try
            {
                int currentUserId = _currentUserService.GetUserId();
                List<Characteristic> characteristicModel = await _characteristicRepository.GetAll(null, x => x.UserId == currentUserId);
                if (characteristicModel == null)
                {
                    return null;
                }

                return characteristicModel.FirstOrDefault();
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async Task<MessageModelWithData<Characteristic>> GetDetailCharacteristicByID(int id)
        {
            try
            {
                int currentUserId = _currentUserService.GetUserId();
                Characteristic characteristicModel = await _characteristicRepository.GetByIdAsync(id);
                if (characteristicModel == null)
                {
                    return new MessageModelWithData<Characteristic>()
                    {
                        Message = "Phong cách thời trang không tồn tại",
                        StatusCode = StatusCodes.Status404NotFound,
                    };
                }
                if (characteristicModel.UserId != currentUserId)
                {
                    return new MessageModelWithData<Characteristic>()
                    {
                        Message = "Bạn không có quyền để xem",
                        StatusCode = StatusCodes.Status403Forbidden,
                    };
                }
                return new MessageModelWithData<Characteristic>()
                {
                    Data = characteristicModel,
                    Message = "Tạo thành công phong cách thời trang của cá nhân",
                    StatusCode = StatusCodes.Status201Created
                };
            }
            catch (Exception ex)
            {
                return new MessageModelWithData<Characteristic>()
                {
                    Message = "Lấy phong cách thời trang thất bại",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        public async Task<MessageModelWithData<Characteristic>> UpdateCharacteristic(RequestCreateUserCharacteristics requestModel)
        {
            try
            {
                int currentUserId = _currentUserService.GetUserId();
                Characteristic existingCharacteristic = (await _characteristicRepository
                    .GetAll(null, x => x.UserId == currentUserId))
                    .FirstOrDefault();

                if (existingCharacteristic == null)
                {
                    return new MessageModelWithData<Characteristic>()
                    {
                        Message = "Không tìm thấy phong cách thời trang của bạn để cập nhật.",
                        StatusCode = StatusCodes.Status404NotFound
                    };
                }

                existingCharacteristic.Weight = requestModel.Weight;
                existingCharacteristic.Height = requestModel.Height;
                existingCharacteristic.Age = requestModel.Age;
                existingCharacteristic.ColorPreference = requestModel.ColorPreference;
                existingCharacteristic.StyleType = requestModel.StyleType;
                existingCharacteristic.OccasionPreference = requestModel.OccasionPreference;
                existingCharacteristic.SkinTone = requestModel.SkinTone;

                await _characteristicRepository.UpdateAsync(existingCharacteristic);
                await _unitOfWork.SaveChanges();

                return new MessageModelWithData<Characteristic>()
                {
                    Data = existingCharacteristic,
                    Message = "Cập nhật phong cách thời trang thành công.",
                    StatusCode = StatusCodes.Status200OK
                };
            }
            catch (Exception ex)
            {
                return new MessageModelWithData<Characteristic>()
                {
                    Message = "Cập nhật phong cách thời trang thất bại.",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }
    }
}
