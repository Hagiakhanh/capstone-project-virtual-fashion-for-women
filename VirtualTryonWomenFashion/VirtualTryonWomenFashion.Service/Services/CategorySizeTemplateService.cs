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
    public class CategorySizeTemplateService : ICategorySizeTemplateService
    {
        private readonly ICategorySizeTemplateRepository _templateSizeRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ISizeRepository _sizeRepository;

        public CategorySizeTemplateService(ICategorySizeTemplateRepository templateSizeRepository,
            IUnitOfWork unitOfWork,
            ISizeRepository sizeRepository)
        {
            _templateSizeRepository = templateSizeRepository;
            _unitOfWork = unitOfWork;
            _sizeRepository = sizeRepository;
        }

        public async Task<MessageModel> CreateCategoryTemplatesAsync(RequestCreateCategoryTemplatesModel request)
        {
            try
            {
                var categoryId = request.CategoryId;
                var newTemplates = request.Templates;

                var existingTemplates = await _templateSizeRepository.GetAll(
                    filter: x => x.CategoryId == categoryId
                );

                if (existingTemplates.Any())
                {
                    return new MessageModel
                    {
                        Message = "Danh mục này đã có bảng số đo. Vui lòng dùng chức năng cập nhật thay vì tạo mới.",
                        StatusCode = StatusCodes.Status400BadRequest
                    };
                }

                var overlapError = await CheckTemplateOverlapAsync(newTemplates);
                if (overlapError != null)
                    return overlapError;

                var listToInsert = BuildTemplateEntities(categoryId, newTemplates);

                await _templateSizeRepository.InsertAsync(listToInsert);
                int result = await _unitOfWork.SaveChanges();

                return new MessageModel
                {
                    Message = result > 0 ? "Tạo mới bảng số đo thành công." : "Không thể tạo bảng số đo.",
                    StatusCode = result > 0 ? StatusCodes.Status201Created : StatusCodes.Status400BadRequest
                };
            }
            catch (Exception)
            {
                return new MessageModel
                {
                    Message = "Lỗi hệ thống: Không thể tạo bảng số đo.",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        public async Task<MessageModel> UpdateCategoryTemplatesAsync(int categoryId, RequestUpdateCategoryTemplatesModel request)
        {
            try
            {
                var newTemplates = request.Templates;

                var overlapError = await CheckTemplateOverlapAsync(newTemplates);
                if (overlapError != null)
                    return overlapError;

                var existingTemplates = await _templateSizeRepository.GetAll(
                    filter: x => x.CategoryId == categoryId
                );
                if (existingTemplates.Any())
                {
                    _templateSizeRepository.DeleteRange(existingTemplates);
                }

                var listToInsert = BuildTemplateEntities(categoryId, newTemplates);

                await _templateSizeRepository.InsertAsync(listToInsert);
                int result = await _unitOfWork.SaveChanges();

                return new MessageModel
                {
                    Message = result > 0 ? "Cập nhật bảng số đo thành công." : "Không thể cập nhật bảng số đo.",
                    StatusCode = result > 0 ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest
                };
            }
            catch (Exception)
            {
                return new MessageModel
                {
                    Message = "Lỗi hệ thống: Không thể cập nhật bảng số đo.",
                    StatusCode = StatusCodes.Status500InternalServerError
                };
            }
        }

        private async Task<MessageModel?> CheckTemplateOverlapAsync(List<TemplateDetailsModel> templates)
        {
            var duplicateSizeIds = templates
                .GroupBy(t => t.SizeId)
                .Where(g => g.Count() > 1)
                .Select(g => g.Key)
                .ToList();

            if (duplicateSizeIds.Any())
            {
                // Lấy danh sách size code để hiển thị rõ hơn
                var duplicatedSizes = new List<string>();
                foreach (var sizeId in duplicateSizeIds)
                {
                    var size = await _sizeRepository.GetByIdAsync(sizeId);
                    if (size != null)
                        duplicatedSizes.Add(size.SizeCode);
                }

                string duplicatedText = string.Join(", ", duplicatedSizes);
                return new MessageModel
                {
                    Message = $"Lỗi: Size {duplicatedText} bị trùng lặp trong danh sách gửi lên.",
                    StatusCode = StatusCodes.Status400BadRequest
                };
            }

            for (int i = 0; i < templates.Count; i++)
            {
                for (int j = i + 1; j < templates.Count; j++)
                {
                    var tplA = templates[i];
                    var tplB = templates[j];

                    bool shoulderOverlap = CheckOverlap(tplA.MinShoulder, tplA.MaxShoulder, tplB.MinShoulder, tplB.MaxShoulder);
                    bool bustOverlap = CheckOverlap(tplA.MinBust, tplA.MaxBust, tplB.MinBust, tplB.MaxBust);
                    bool waistOverlap = CheckOverlap(tplA.MinWaist, tplA.MaxWaist, tplB.MinWaist, tplB.MaxWaist);
                    bool hipsOverlap = CheckOverlap(tplA.MinHips, tplA.MaxHips, tplB.MinHips, tplB.MaxHips);

                    if (shoulderOverlap && bustOverlap && waistOverlap && hipsOverlap)
                    {
                        var sizeA = await _sizeRepository.GetByIdAsync(tplA.SizeId);
                        var sizeB = await _sizeRepository.GetByIdAsync(tplB.SizeId);

                        return new MessageModel
                        {
                            Message = $"Lỗi: Số đo của size {sizeA?.SizeCode} và {sizeB?.SizeCode} trong danh sách gửi lên bị chồng lấn.",
                            StatusCode = StatusCodes.Status400BadRequest
                        };
                    }
                }
            }

            return null; // Không có lỗi
        }

        private List<CategorySizeTemplate> BuildTemplateEntities(int categoryId, List<TemplateDetailsModel> newTemplates)
        {
            var list = new List<CategorySizeTemplate>();

            foreach (var tpl in newTemplates)
            {
                list.Add(new CategorySizeTemplate
                {
                    CategoryId = categoryId,
                    SizeId = tpl.SizeId,
                    MinShoulder = tpl.MinShoulder,
                    MaxShoulder = tpl.MaxShoulder,
                    MinBust = tpl.MinBust,
                    MaxBust = tpl.MaxBust,
                    MinWaist = tpl.MinWaist,
                    MaxWaist = tpl.MaxWaist,
                    MinHips = tpl.MinHips,
                    MaxHips = tpl.MaxHips
                });
            }

            return list;
        }

        /**
         * Hàm helper để kiểm tra overlap, có xử lý giá trị nullable
         * Trả về true nếu có khả năng overlap, false nếu không
         */
        private bool CheckOverlap(double? minA, double? maxA, double? minB, double? maxB)
        {
            // Nếu một trong các khoảng không định nghĩa (null) -> xem như không overlap
            if (minA == null || maxA == null || minB == null || maxB == null)
            {
                return false;
            }

            // Logic: Hai khoảng [a, b] và [c, d] overlap nếu !(b < c || a > d)
            // Tương đương với (b >= c && a <= d)
            return (maxA >= minB && minA <= maxB);
        }

        public async Task<List<CategorySizeTemplate>> GetAllTemplateByCategoryId(int categoryId)
        {
            try
            {
                List<CategorySizeTemplate> templates = await _templateSizeRepository.GetAllTemplateByCategoryId(categoryId);

                if (templates == null)
                {
                    throw new ArgumentNullException("Not found");
                }

                return templates;
            }
            catch (Exception ex)
            {
                throw new Exception("Fail");
            }
        }

        public async Task<List<CategorySizeTemplate>> GetListTemplateSizeByBody(double bust, double waist, double hips)
        {
            var templates = await _templateSizeRepository.GetAll(null, null, null, [x => x.Size, x => x.Category]);

            if (templates == null || !templates.Any())
                return new List<CategorySizeTemplate?>();

            // 1️⃣ Tìm template khớp chính xác theo khoảng đo
            var matched = templates.Where(t =>
                bust >= t.MinBust && bust <= t.MaxBust &&
                waist >= t.MinWaist && waist <= t.MaxWaist &&
                hips >= t.MinHips && hips <= t.MaxHips
            ).ToList();

            if (matched.Any())
                return matched;

            decimal bustDec = (decimal)bust;
            decimal waistDec = (decimal)waist;
            decimal hipsDec = (decimal)hips;

            var closestPerCategory = templates
                .GroupBy(t => t.Category.CategoryId) // nhóm theo category
                .Select(g =>
                {
                    var closest = g
                        .Select(t => new
                        {
                            Template = t,
                            Deviation =
                                Math.Abs(bustDec - ((decimal)(t.MinBust + t.MaxBust) / 2)) +
                                Math.Abs(waistDec - ((decimal)(t.MinWaist + t.MaxWaist) / 2)) +
                                Math.Abs(hipsDec - ((decimal)(t.MinHips + t.MaxHips) / 2))
                        })
                        .OrderBy(x => x.Deviation)
                        .FirstOrDefault()?.Template;

                    return closest;
                })
                .Where(t => t != null)
                .ToList();

            return closestPerCategory!;
        }

    }
}
