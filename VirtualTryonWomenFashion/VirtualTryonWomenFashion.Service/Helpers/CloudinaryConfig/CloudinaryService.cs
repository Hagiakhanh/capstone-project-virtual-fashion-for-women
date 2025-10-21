using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.Extensions.Options;
using System.Net.Mime;
using System.Text.RegularExpressions;

namespace VirtualTryonWomenFashion.Service.Helpers.CloudinaryConfig
{
    public class CloudinaryService : ICloudinaryService
    {
        private readonly IOptions<CloudinarySettings> _config;
        private readonly Cloudinary _cloudinary;

        public CloudinaryService(IOptions<CloudinarySettings> config)
        {
            var account = new Account(
                config.Value.CloudName,
                config.Value.ApiKey,
                config.Value.ApiSecret);

            _config = config;
            _cloudinary = new Cloudinary(account);
        }

        public async Task<string> UploadImageAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return null;

            // Tạo stream từ file
            using var stream = file.OpenReadStream();

            // Upload parameters
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Transformation = new Transformation().Quality("auto").FetchFormat("auto"),
                UploadPreset = _config.Value.UploadPreset // default if not set 

            };
            // Upload to Cloudinary
            var result = await _cloudinary.UploadAsync(uploadParams);

            // Kiểm tra kết quả và trả về URL
            return result.Error != null ? null : result.SecureUrl.ToString();
        }

        /*public async Task<List<string>> UploadMultipleImagesAsync(List<IFormFile> files)
        {
            if (files == null || !files.Any())
                return new List<string>();

            var uploadTasks = files.Select(UploadImageAsync);
            var urls = await Task.WhenAll(uploadTasks);

            return urls.Where(url => url != null).ToList();
        }*/

        public async Task<List<string>> UploadMultipleImagesAsync(List<IFormFile> files)
        {
            if (files == null || !files.Any())
                return new List<string>();

            // Giới hạn chỉ 5 tác vụ upload chạy cùng lúc
            var semaphore = new SemaphoreSlim(5);

            var uploadTasks = new List<Task<string>>();

            foreach (var file in files)
            {
                // Chờ để có được một "suất" chạy
                await semaphore.WaitAsync();

                uploadTasks.Add(Task.Run(async () =>
                {
                    try
                    {
                        return await UploadImageAsync(file);
                    }
                    finally
                    {
                        // Giải phóng "suất" để tác vụ khác có thể chạy
                        semaphore.Release();
                    }
                }));
            }

            var urls = await Task.WhenAll(uploadTasks);
            return urls.Where(url => url != null).ToList();
        }

        /// <summary>
        /// Xóa một ảnh khỏi Cloudinary dựa trên URL đầy đủ của ảnh.
        /// </summary>
        /// <param name="imageUrl">URL công khai của ảnh cần xóa.</param>
        /// <returns>Đối tượng DeletionResult từ Cloudinary.</returns>
        public async Task<DeletionResult> DeleteImageAsync(string imageUrl)
        {
            var publicId = GetPublicIdFromUrl(imageUrl);

            if (string.IsNullOrEmpty(publicId))
            {
                return new DeletionResult { Result = "Failed to parse Public ID from URL." };
            }

            var deletionParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deletionParams);

            return result;
        }

        /// <summary>
        /// Xóa nhiều ảnh khỏi Cloudinary một cách song song.
        /// </summary>
        /// <param name="imageUrls">Danh sách các URL của ảnh cần xóa.</param>
        /// <returns>Một Dictionary chứa URL và kết quả xóa ("ok" hoặc thông báo lỗi).</returns>
        public async Task<Dictionary<string, string>> DeleteMultipleImagesAsync(List<string> imageUrls)
        {
            if (imageUrls == null || !imageUrls.Any())
                return new Dictionary<string, string>();

            var results = new Dictionary<string, string>();

            // Sử dụng SemaphoreSlim để giới hạn số lượng request xóa đồng thời
            var semaphore = new SemaphoreSlim(5);

            var deleteTasks = imageUrls.Select(async url =>
            {
                await semaphore.WaitAsync();
                try
                {
                    var result = await DeleteImageAsync(url);
                    return (Url: url, Result: result);
                }
                finally
                {
                    semaphore.Release();
                }
            });

            var taskResults = await Task.WhenAll(deleteTasks);

            foreach (var res in taskResults)
            {
                // Cloudinary trả về "ok" khi thành công
                results[res.Url] = res.Result.Result ?? res.Result.Error?.Message ?? "Unknown error";
            }

            return results;
        }

        /// <summary>
        /// Helper private để trích xuất Public ID từ một URL Cloudinary.
        /// Ví dụ: "http://.../v12345/folder/image.jpg" -> "folder/image"
        /// </summary>
        private string GetPublicIdFromUrl(string url)
        {
            if (string.IsNullOrEmpty(url))
                return null;

            try
            {
                // Regex để tìm chuỗi giữa version (vd: /v123456/) và phần mở rộng file (.jpg, .png)
                var match = Regex.Match(url, @"/v\d+/(.+?)(?:\.\w+)?$");
                if (match.Success)
                {
                    return match.Groups[1].Value;
                }

                // Fallback nếu URL không có version (hiếm gặp)
                var uri = new Uri(url);
                var lastSegment = uri.Segments.Last();
                var dotIndex = lastSegment.LastIndexOf('.');
                return dotIndex == -1 ? lastSegment : lastSegment.Substring(0, dotIndex);
            }
            catch (Exception)
            {
                // Nếu URL không hợp lệ
                return null;
            }
        }

        public async Task<string> UploadImageFromUrlAsync(string imageUrl)  // upload từ URL
        {
            using var httpClient = new HttpClient();
            var response = await httpClient.GetAsync(imageUrl);
            response.EnsureSuccessStatusCode();

            var stream = await response.Content.ReadAsStreamAsync();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription("image.jpg", stream),
                Transformation = new Transformation().Quality("auto").FetchFormat("auto"),
                UploadPreset = _config.Value.UploadPreset
            };

            var result = await _cloudinary.UploadAsync(uploadParams);
            return result.Error != null ? null : result.SecureUrl.ToString();
        }
    }
}
