using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Service.DTO.ProductColor;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;
using VirtualTryonWomenFashion.Service.Helpers.CloudinaryConfig;

namespace VirtualTryonWomenFashion.Service.Helpers
{
    /// <summary>
    /// Lớp nội bộ để theo dõi các tác vụ upload cho mỗi color request
    /// </summary>
    public class ColorUploadJob
    {
        public CreateProductColorRequest Request { get; }
        public Task<string> NoBgUploadTask { get; }
        public Task<List<string>> VariantImagesTask { get; }
        public Dictionary<CreateProductVariantRequest, Task<string>> VariantImageTasks { get; }

        // Dùng để lưu kết quả sau khi Task.WhenAll chạy xong
        public string NoBgUrl { get; private set; }
        public List<string> VariantImageUrls { get; private set; }
        public Dictionary<CreateProductVariantRequest, string> VariantImageUrlsDict { get; }

        public ColorUploadJob(CreateProductColorRequest request, ICloudinaryService cloudinaryService)
        {
            Request = request;
            VariantImageTasks = new Dictionary<CreateProductVariantRequest, Task<string>>();
            VariantImageUrlsDict = new Dictionary<CreateProductVariantRequest, string>();

            // 1. Tạo Task cho ảnh No-BG
            NoBgUploadTask = cloudinaryService.UploadImageAsync(request.NoBgImgUrl);

            // 2. Tạo Task cho danh sách ảnh biến thể (multi-images)
            if (request.ProductVariantImages?.Count > 0)
            {
                VariantImagesTask = cloudinaryService.UploadMultipleImagesAsync(request.ProductVariantImages);
            }
            else
            {
                VariantImagesTask = Task.FromResult(new List<string>()); // Task hoàn thành ngay lập tức
            }

            // 3. Tạo Task cho từng ảnh của từng variant (size)
            if (request.Variants?.Count > 0)
            {
                foreach (var variant in request.Variants)
                {
                    var task = cloudinaryService.UploadImageAsync(variant.ImageUrl);
                    VariantImageTasks[variant] = task;
                }
            }
        }

        /// <summary>
        /// Thu thập tất cả các task từ job này
        /// </summary>
        public IEnumerable<Task> GetAllTasks()
        {
            yield return NoBgUploadTask;
            yield return VariantImagesTask;
            foreach (var task in VariantImageTasks.Values)
            {
                yield return task;
            }
        }

        /// <summary>
        /// Lấy kết quả từ các task đã hoàn thành (chỉ gọi sau Task.WhenAll)
        /// </summary>
        public async Task MaterializeResultsAsync(List<string> allUploadedUrls)
        {
            NoBgUrl = await NoBgUploadTask;
            if (!string.IsNullOrEmpty(NoBgUrl))
                allUploadedUrls.Add(NoBgUrl);

            VariantImageUrls = await VariantImagesTask;
            if (VariantImageUrls.Count > 0)
                allUploadedUrls.AddRange(VariantImageUrls);

            foreach (var kvp in VariantImageTasks)
            {
                var url = await kvp.Value;
                if (!string.IsNullOrEmpty(url))
                {
                    VariantImageUrlsDict[kvp.Key] = url;
                    allUploadedUrls.Add(url);
                }
                else
                {
                    VariantImageUrlsDict[kvp.Key] = string.Empty;
                }
            }
        }
    }
}
