using AutoMapper;
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
using VirtualTryonWomenFashion.Service.DTO.Category;
using VirtualTryonWomenFashion.Service.DTO.Product;
using VirtualTryonWomenFashion.Service.DTO.ProductColor;
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
        private readonly IMapper _mapper;

        public CategorySizeTemplateService(ICategorySizeTemplateRepository templateSizeRepository,
            IUnitOfWork unitOfWork,
            ISizeRepository sizeRepository,
            IMapper mapper)
        {
            _templateSizeRepository = templateSizeRepository;
            _unitOfWork = unitOfWork;
            _sizeRepository = sizeRepository;
            _mapper = mapper;
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
            foreach (var tpl in templates)
            {
                // Danh sách các cặp (Min, Max) cần kiểm tra
                var ranges = new List<(double?, double?)>
                {
                    (tpl.MinShoulder, tpl.MaxShoulder),
                    (tpl.MinBust, tpl.MaxBust),
                    (tpl.MinWaist, tpl.MaxWaist),
                    (tpl.MinHips, tpl.MaxHips)
                };

                // Kiểm tra từng cặp: nếu cả hai đều có giá trị (không null) và Min > Max thì lỗi
                foreach (var (min, max) in ranges)
                {
                    if (min.HasValue && max.HasValue && min.Value > max.Value)
                    {
                        var size = await _sizeRepository.GetByIdAsync(tpl.SizeId);
                        return new MessageModel
                        {
                            Message = $"Lỗi: Khoảng giá trị của size **{size?.SizeCode}** không hợp lệ (Min lớn hơn Max).",
                            StatusCode = StatusCodes.Status400BadRequest
                        };
                    }
                }
            }

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

        public async Task<List<CategoryTemplateSizeResponse>> GetAllTemplateByCategoryIdNotFullModel(int categoryId)
        {
            try
            {
                List<CategorySizeTemplate> templates = await _templateSizeRepository.GetAllTemplateByCategoryId(categoryId);

                if (templates == null)
                {
                    throw new ArgumentNullException("Not found");
                }

                var resutl = _mapper.Map<List<CategoryTemplateSizeResponse>>(templates);

                return resutl;
            }
            catch (Exception ex)
            {
                throw new Exception("Fail");
            }
        }

        public async Task<List<CategorySizeTemplate>> GetListTemplateSizeByBody(
     int categoryId, double bust, double waist, double hips, double? shoulder = null)
        {
            var templates = await _templateSizeRepository.GetAll(
                null,
                x => x.CategoryId == categoryId,
                null,
                includes: [x => x.Size, x => x.Category]
            );

            if (templates == null || !templates.Any())
                return new List<CategorySizeTemplate>();

            var category = templates.First().Category;
            string bodyPart = category.BodyPart; // Thân trên / Thân dưới / Toàn thân

            decimal bustDec = (decimal)bust;
            decimal waistDec = (decimal)waist;
            decimal hipsDec = (decimal)hips;
            decimal? shoulderDes = null;
            if (shoulder != null)
            {
                shoulderDes = (decimal)shoulder.Value;
            }

            // ===============================
            // 1️⃣ Tạo rule match theo BodyPart
            // ===============================
            Func<CategorySizeTemplate, bool> exactMatch;
            Func<CategorySizeTemplate, decimal> deviation;

            switch (bodyPart)
            {
                case "Thân trên": // Áo
                    exactMatch = t =>
                        bust >= (t.MinBust ?? double.MinValue) && bust <= (t.MaxBust ?? double.MaxValue) &&
                        waist >= (t.MinWaist ?? double.MinValue) && waist <= (t.MaxWaist ?? double.MaxValue) &&
                        (shoulderDes == null ||
                         (shoulderDes >= (decimal)(t.MinShoulder ?? double.MinValue) &&
                          shoulderDes <= (decimal)(t.MaxShoulder ?? double.MaxValue))
                        );

                    deviation = t =>
                        Math.Abs(bustDec - Center(t.MinBust, t.MaxBust)) +
                        Math.Abs(waistDec - Center(t.MinWaist, t.MaxWaist)) +
                        (shoulderDes == null
                            ? 0
                            : Math.Abs(shoulderDes.Value - Center(t.MinShoulder, t.MaxShoulder))
                        );
                    break;

                case "Thân dưới": // Váy + Quần
                    exactMatch = t =>
                        waist >= (t.MinWaist ?? double.MinValue) && waist <= (t.MaxWaist ?? double.MaxValue) &&
                        hips >= (t.MinHips ?? double.MinValue) && hips <= (t.MaxHips ?? double.MaxValue);

                    deviation = t =>
                        Math.Abs(waistDec - Center(t.MinWaist, t.MaxWaist)) +
                        Math.Abs(hipsDec - Center(t.MinHips, t.MaxHips));
                    break;

                case "Toàn thân": // Đầm
                    exactMatch = t =>
                        bust >= (t.MinBust ?? double.MinValue) && bust <= (t.MaxBust ?? double.MaxValue) &&
                        waist >= (t.MinWaist ?? double.MinValue) && waist <= (t.MaxWaist ?? double.MaxValue) &&
                        hips >= (t.MinHips ?? double.MinValue) && hips <= (t.MaxHips ?? double.MaxValue);

                    deviation = t =>
                        Math.Abs(bustDec - Center(t.MinBust, t.MaxBust)) +
                        Math.Abs(waistDec - Center(t.MinWaist, t.MaxWaist)) +
                        Math.Abs(hipsDec - Center(t.MinHips, t.MaxHips));
                    break;

                default:
                    return new List<CategorySizeTemplate>();
            }

            // ===============================
            // 2️⃣ Tìm template khớp chính xác
            // ===============================
            var matched = templates.Where(exactMatch).ToList();
            if (matched.Any())
                return matched;

            // ===============================
            // 3️⃣ Không khớp → chọn size gần nhất
            // ===============================
            var closest = templates
                .Select(t => new
                {
                    Template = t,
                    Dev = deviation(t)
                })
                .OrderBy(x => x.Dev)
                .First()
                .Template;

            return new List<CategorySizeTemplate> { closest };
        }

        /*public async Task<List<CategorySizeTemplate>> GetListTemplateSizeByBody(
            int categoryId, double bust, double waist, double hips, double? shoulder = null)
        {
            var templates = await _templateSizeRepository.GetAll(
                null,
                x => x.CategoryId == categoryId,
                null,
                includes: [x => x.Size, x => x.Category]
            );

            if (templates == null || !templates.Any())
                return new List<CategorySizeTemplate>();

            var category = templates.First().Category;
            string bodyPart = category.BodyPart; // Thân trên / Thân dưới / Toàn thân

            decimal bustDec = (decimal)bust;
            decimal waistDec = (decimal)waist;
            decimal hipsDec = (decimal)hips;
            decimal? shoulderDes = null;
            if (shoulder != null)
            {
                shoulderDes = (decimal)shoulder.Value;
            }

            // ===============================
            // 1️⃣ Tạo rule match theo BodyPart
            // ===============================
            Func<CategorySizeTemplate, bool> exactMatch;
            Func<CategorySizeTemplate, decimal> deviation;

            switch (bodyPart)
            {
                case "Thân trên":
                    exactMatch = t =>
                        bust >= (t.MinBust ?? double.MinValue) && bust <= (t.MaxBust ?? double.MaxValue) &&
                        waist >= (t.MinWaist ?? double.MinValue) && waist <= (t.MaxWaist ?? double.MaxValue) &&
                        (shoulderDes == null ||
                         (shoulderDes >= (decimal)(t.MinShoulder ?? double.MinValue) &&
                          shoulderDes <= (decimal)(t.MaxShoulder ?? double.MaxValue))
                        );

                    // LOGIC DEVIATION MỚI: Ưu tiên Min Tightness (bị chật) -> Max Slack (bị rộng)
                    deviation = t =>
                    {
                        // 1. Tính độ chật (Tightness)
                        // Phạt nặng nếu bất kỳ số đo nào > Max của template
                        decimal bustTightness = 0m;
                        if (t.MaxBust.HasValue)
                            bustTightness = Math.Max(0m, bustDec - (decimal)t.MaxBust.Value);

                        decimal waistTightness = 0m;
                        if (t.MaxWaist.HasValue)
                            waistTightness = Math.Max(0m, waistDec - (decimal)t.MaxWaist.Value);

                        decimal shoulderTightness = 0m;
                        if (t.MaxShoulder.HasValue && shoulderDes.HasValue)
                            shoulderTightness = Math.Max(0m, shoulderDes.Value - (decimal)t.MaxShoulder.Value);

                        decimal maxTightness = Math.Max(bustTightness, Math.Max(waistTightness, shoulderTightness));

                        // Nếu có bất kỳ độ chật nào, áp dụng một hình phạt rất lớn (1.000.000)
                        if (maxTightness > 0m)
                            return maxTightness * 1000000m;

                        // 2. Tính độ rộng/lỏng (Slack)
                        // Tổng độ lỏng so với Min. Ta chọn size có tổng độ lỏng nhỏ nhất (size nhỏ nhất mà vẫn không bị chật)
                        decimal bustSlack = 0m;
                        if (t.MinBust.HasValue)
                            bustSlack = Math.Max(0m, (decimal)t.MinBust.Value - bustDec);

                        decimal waistSlack = 0m;
                        if (t.MinWaist.HasValue)
                            waistSlack = Math.Max(0m, (decimal)t.MinWaist.Value - waistDec);

                        decimal shoulderSlack = 0m;
                        if (t.MinShoulder.HasValue && shoulderDes.HasValue)
                            shoulderSlack = Math.Max(0m, (decimal)t.MinShoulder.Value - shoulderDes.Value);

                        // Trả về tổng độ lỏng
                        return bustSlack + waistSlack + shoulderSlack;
                    };
                    break;

                case "Thân dưới": // Váy + Quần
                                  // Logic exactMatch giữ nguyên
                    exactMatch = t =>
                        waist >= (t.MinWaist ?? double.MinValue) && waist <= (t.MaxWaist ?? double.MaxValue) &&
                        hips >= (t.MinHips ?? double.MinValue) && hips <= (t.MaxHips ?? double.MaxValue);

                    // LOGIC DEVIATION MỚI
                    deviation = t =>
                    {
                        // 1. Tính độ chật (Tightness)
                        decimal waistTightness = 0m;
                        if (t.MaxWaist.HasValue)
                            waistTightness = Math.Max(0m, waistDec - (decimal)t.MaxWaist.Value);

                        decimal hipsTightness = 0m;
                        if (t.MaxHips.HasValue)
                            hipsTightness = Math.Max(0m, hipsDec - (decimal)t.MaxHips.Value);

                        decimal maxTightness = Math.Max(waistTightness, hipsTightness);

                        if (maxTightness > 0m)
                            return maxTightness * 1000000m;

                        // 2. Tính độ rộng/lỏng (Slack)
                        decimal waistSlack = 0m;
                        if (t.MinWaist.HasValue)
                            waistSlack = Math.Max(0m, (decimal)t.MinWaist.Value - waistDec);

                        decimal hipsSlack = 0m;
                        if (t.MinHips.HasValue)
                            hipsSlack = Math.Max(0m, (decimal)t.MinHips.Value - hipsDec);

                        return waistSlack + hipsSlack;
                    };
                    break;

                case "Toàn thân": // Đầm
                                  // Logic exactMatch giữ nguyên
                    exactMatch = t =>
                        bust >= (t.MinBust ?? double.MinValue) && bust <= (t.MaxBust ?? double.MaxValue) &&
                        waist >= (t.MinWaist ?? double.MinValue) && waist <= (t.MaxWaist ?? double.MaxValue) &&
                        hips >= (t.MinHips ?? double.MinValue) && hips <= (t.MaxHips ?? double.MaxValue);

                    // LOGIC DEVIATION MỚI
                    deviation = t =>
                    {
                        // 1. Tính độ chật (Tightness)
                        decimal bustTightness = 0m;
                        if (t.MaxBust.HasValue)
                            bustTightness = Math.Max(0m, bustDec - (decimal)t.MaxBust.Value);

                        decimal waistTightness = 0m;
                        if (t.MaxWaist.HasValue)
                            waistTightness = Math.Max(0m, waistDec - (decimal)t.MaxWaist.Value);

                        decimal hipsTightness = 0m;
                        if (t.MaxHips.HasValue)
                            hipsTightness = Math.Max(0m, hipsDec - (decimal)t.MaxHips.Value);

                        decimal maxTightness = Math.Max(bustTightness, Math.Max(waistTightness, hipsTightness));

                        if (maxTightness > 0m)
                            return maxTightness * 1000000m;

                        // 2. Tính độ rộng/lỏng (Slack)
                        decimal bustSlack = 0m;
                        if (t.MinBust.HasValue)
                            bustSlack = Math.Max(0m, (decimal)t.MinBust.Value - bustDec);

                        decimal waistSlack = 0m;
                        if (t.MinWaist.HasValue)
                            waistSlack = Math.Max(0m, (decimal)t.MinWaist.Value - waistDec);

                        decimal hipsSlack = 0m;
                        if (t.MinHips.HasValue)
                            hipsSlack = Math.Max(0m, (decimal)t.MinHips.Value - hipsDec);

                        return bustSlack + waistSlack + hipsSlack;
                    };
                    break;

                default:
                    return new List<CategorySizeTemplate>();
            }

            // ... (Phần tìm kiếm và trả về kết quả giữ nguyên) ...

            // ===============================
            // 2️⃣ Tìm template khớp chính xác
            // ===============================
            var matched = templates.Where(exactMatch).ToList();
            if (matched.Any())
                return matched;

            // ===============================
            // 3️⃣ Không khớp → chọn size gần nhất
            // Logic này hiện tại sẽ ưu tiên size không bị chật, sau đó là size nhỏ nhất
            // ===============================
            var closest = templates
                .Select(t => new
                {
                    Template = t,
                    Dev = deviation(t)
                })
                .OrderBy(x => x.Dev) // Dev thấp nhất = Ít chật nhất (hoặc không chật) và ít lỏng nhất
                .First()
                .Template;

            return new List<CategorySizeTemplate> { closest };
        }*/

        // =====================================
        // Helper tránh lỗi null + convert double? → decimal
        // =====================================
        private decimal ToDec(double? value)
        {
            if (value == null)
                return 0;
            return (decimal)value.Value;
        }

        private decimal Center(double? min, double? max)
        {
            decimal a = ToDec(min);
            decimal b = ToDec(max);
            return (a + b) / 2;
        }

    }
}
