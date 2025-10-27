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
        private readonly ISkinToneRepository _skinToneRepository;
        private readonly IStyleTypeRepository _styleTypeRepository;
        private readonly IOccasionPreferenceRepository _OccasionPreferenceRepository;


        public CharacteristicService(ICharacteristicRepository characteristicRepository, IUnitOfWork unitOfWork, ICurrentUserService currentUserService, IMapper mapper
            , ISkinToneRepository skinToneRepository, IOccasionPreferenceRepository occasionPreferenceRepository, IStyleTypeRepository styleTypeRepository)
        {
            _characteristicRepository = characteristicRepository;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _mapper = mapper;
            _skinToneRepository = skinToneRepository;
            _styleTypeRepository = styleTypeRepository;
            _OccasionPreferenceRepository = occasionPreferenceRepository;
        }
        public async Task<MessageModelWithData<Characteristic>> CreateCharacteristic(RequestCreateUserCharacteristics requestModel)
        {
            try
            {

                int currentUserId = _currentUserService.GetUserId();

                // Kiểm tra đã tồn tại đặc điểm người dùng hay chưa
                int existedCharacteristic = _characteristicRepository.Count(x => x.UserId == currentUserId);
                if (existedCharacteristic > 0)
                {
                    return new MessageModelWithData<Characteristic>()
                    {
                        Data = null,
                        Message = "Tạo thất bại - bạn đã có phong cách thời trang được lưu.",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }
                // Tạo đối tượng mới
                var newCharacteristic = new Characteristic
                {
                    UserId = currentUserId,
                    Weight = requestModel.Weight,
                    Height = requestModel.Height,
                    Age = requestModel.Age
                };
                if (requestModel.Waist != null && requestModel.Hips != null && requestModel.Bust != null)
                {
                    if ((requestModel.Waist <= 30 || requestModel.Hips <= 30 || requestModel.Bust <= 30) ||
                        (requestModel.Waist > 200 || requestModel.Hips > 200 || requestModel.Bust > 200))
                    {
                        throw new ArgumentException("Số đo 3 vòng chọn không hợp lệ");
                    }
                    newCharacteristic.Bust = requestModel.Bust;
                    newCharacteristic.Waist = requestModel.Waist;
                    newCharacteristic.Hips = requestModel.Hips;
                }
               

                // ---- Xử lý StyleType ----
                if (requestModel.StyleTypeID == 0)
                {
                    newCharacteristic.StyleTypeId = null;
                    newCharacteristic.StyleTypeNote = requestModel.StyleTypeNote?.Trim();
                }
                else
                {
                    var styleType = await _styleTypeRepository.GetByIdAsync(requestModel.StyleTypeID);
                    if (styleType != null)
                    {
                        newCharacteristic.StyleTypeId = requestModel.StyleTypeID;
                        newCharacteristic.StyleTypeNote = "";
                    }
                    else
                    {
                        throw new ArgumentException("Loại phong cách được chọn không hợp lệ");
                    }
                }

                // ---- Xử lý OccasionPreference ----
                if (requestModel.OccasionPreferenceID == 0)
                {
                    newCharacteristic.OccasionPreferenceId = null;
                    newCharacteristic.OccasionNote = requestModel.OccasionPreferenceNote?.Trim();
                }
                else
                {
                    var occasion = await _OccasionPreferenceRepository.GetByIdAsync(requestModel.OccasionPreferenceID);
                    if (occasion != null)
                    {
                        newCharacteristic.OccasionPreferenceId = requestModel.OccasionPreferenceID;
                        newCharacteristic.OccasionNote = "";
                    }
                    else
                    {
                        throw new ArgumentException("Mục tiêu mặc đồ được chọn không hợp lệ");
                    }
                }

                // ---- Xử lý SkinTone ----
                if (requestModel.SkinToneID == 0)
                {
                    newCharacteristic.SkinToneId = null;
                    newCharacteristic.SkinToneNote = requestModel.SkinToneNote?.Trim();
                }
                else
                {
                    var skinTone = await _skinToneRepository.GetByIdAsync(requestModel.SkinToneID);
                    if (skinTone != null)
                    {
                        newCharacteristic.SkinToneId = requestModel.SkinToneID;
                        newCharacteristic.SkinToneNote = "";
                    }
                    else
                    {
                        throw new ArgumentException("Tông da được chọn không hợp lệ");
                    }
                }

                // ---- Lưu vào DB ----
                await _characteristicRepository.InsertAsync(newCharacteristic);
                await _unitOfWork.SaveChanges();

                return new MessageModelWithData<Characteristic>()
                {
                    Data = newCharacteristic,
                    Message = "Tạo thành công phong cách thời trang cá nhân.",
                    StatusCode = StatusCodes.Status201Created
                };
            }
            catch (ArgumentException ex)
            {
                return new MessageModelWithData<Characteristic>()
                {
                    Message = "Tạo phong cách thời trang thất bại - " + ex.Message,
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }
            catch (Exception ex)
            {
                return new MessageModelWithData<Characteristic>()
                {
                    Message = "Tạo phong cách thời trang thất bại.",
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

            if (c.Bust.HasValue)
                parts.Add($"vòng một {c.Bust} cm");

            if (c.Waist.HasValue)
                parts.Add($"vòng eo {c.Waist} cm");

            if (c.Hips.HasValue)
                parts.Add($"vòng hông {c.Hips} cm");
            // Làn da (SkinTone hoặc SkinToneNote)
            string skinTone = c.SkinTone != null
                ? c.SkinTone.SkinToneName
                : c.SkinToneNote;

            if (!string.IsNullOrWhiteSpace(skinTone))
                parts.Add($"có làn da {skinTone.ToLower()}");

            var sentence = string.Join(", ", parts);
            if (!string.IsNullOrWhiteSpace(sentence))
                sentence = sentence.TrimEnd(',') + ".";

            // Phong cách (StyleType hoặc StyleTypeNote)
            string styleType = c.StyleType != null
                ? c.StyleType.StyleTypeName
                : c.StyleTypeNote;

            if (!string.IsNullOrWhiteSpace(styleType))
                sentence += $" Phong cách tôi yêu thích là {styleType.ToLower()}.";

            // Dịp (OccasionPreference hoặc OccasionNote)
            string occasion = c.OccasionPreference != null
                ? c.OccasionPreference.OccasionPreferenceName
                : c.OccasionNote;

            if (!string.IsNullOrWhiteSpace(occasion))
                sentence += $" Tôi thường chọn trang phục cho dịp {occasion.ToLower()}.";

            return sentence;
        }


        public async Task<Characteristic> GetCurrentCharacteristicForUser()
        {
            try
            {
                int currentUserId = _currentUserService.GetUserId();
                List<Characteristic> characteristicModel = await _characteristicRepository.GetAll(null, x => x.UserId == currentUserId, null, [x => x.OccasionPreference, x => x.SkinTone, x => x.StyleType]);
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
                    Message = "Lấy thành công phong cách thời trang của cá nhân",
                    StatusCode = StatusCodes.Status200OK
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
                if (requestModel.Waist != null && requestModel.Hips != null && requestModel.Bust != null)
                {
                    if ((requestModel.Waist <= 30 || requestModel.Hips <= 30 || requestModel.Bust <= 30) ||
                        (requestModel.Waist > 200 || requestModel.Hips > 200 || requestModel.Bust > 200))
                    {
                        throw new ArgumentException("Số đo 3 vòng chọn không hợp lệ");
                    }
                    existingCharacteristic.Bust = requestModel.Bust;
                    existingCharacteristic.Waist = requestModel.Waist;
                    existingCharacteristic.Hips = requestModel.Hips;
                }

                if (requestModel.StyleTypeID == 0)
                {
                    existingCharacteristic.StyleTypeNote = requestModel.StyleTypeNote.Trim();
                    existingCharacteristic.StyleTypeId = null;
                }
                else
                {
                    StyleType styleTypeSelected = await _styleTypeRepository.GetByIdAsync(requestModel.StyleTypeID);
                    if (styleTypeSelected != null)
                    {
                        existingCharacteristic.StyleTypeId = requestModel.StyleTypeID;
                        existingCharacteristic.StyleTypeNote = "";
                    }
                    else
                    {
                        throw new ArgumentException("Loại phong cách được chọn không hợp lệ");
                    }
                }
                if (requestModel.OccasionPreferenceID == 0)
                {
                    existingCharacteristic.OccasionPreferenceId = null;
                    existingCharacteristic.OccasionNote = requestModel.OccasionPreferenceNote.Trim();
                }
                else
                {
                    OccasionPreference occasionPreferenceSelected = await _OccasionPreferenceRepository.GetByIdAsync(requestModel.OccasionPreferenceID);
                    if (occasionPreferenceSelected != null)
                    {
                        existingCharacteristic.OccasionPreferenceId = requestModel.OccasionPreferenceID;
                        existingCharacteristic.OccasionNote = "";
                    }
                    else
                    {
                        throw new ArgumentException("Mục tiêu mặc đồ được chọn không hợp lệ");
                    }
                }
                if (requestModel.SkinToneID == 0)
                {
                    existingCharacteristic.SkinToneId = null;
                    existingCharacteristic.SkinToneNote = requestModel.SkinToneNote.Trim();
                }
                else
                {

                    SkinTone skinToneSelected = await _skinToneRepository.GetByIdAsync(requestModel.SkinToneID);
                    if (skinToneSelected != null)
                    {
                        existingCharacteristic.SkinToneId = requestModel.SkinToneID;
                        existingCharacteristic.SkinToneNote = "";
                    }
                    else
                    {
                        throw new ArgumentException("Tông da được chọn không hợp lệ");
                    }
                }


                await _characteristicRepository.UpdateAsync(existingCharacteristic);
                await _unitOfWork.SaveChanges();

                return new MessageModelWithData<Characteristic>()
                {
                    Data = existingCharacteristic,
                    Message = "Cập nhật phong cách thời trang thành công.",
                    StatusCode = StatusCodes.Status200OK
                };
            }
            catch (ArgumentException ex)
            {
                return new MessageModelWithData<Characteristic>()
                {
                    Message = "Cập nhật phong cách thời trang thất bại - " + ex.Message,
                    StatusCode = StatusCodes.Status400BadRequest,
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
