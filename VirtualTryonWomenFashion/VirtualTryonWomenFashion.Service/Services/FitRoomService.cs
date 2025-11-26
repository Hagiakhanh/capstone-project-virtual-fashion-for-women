using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using VirtualTryonWomenFashion.Service.DTO.UploadImageModel;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services;

public class FitRoomService : IFitRoomService
{
    private readonly HttpClient _httpClient;
    private readonly string _baseUrl;
    private readonly string _apiKey;

    public FitRoomService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _baseUrl = configuration["FitRoomSetting:BaseUrl"];
        _apiKey = configuration["FitRoomSetting:ApiKey"];
    }

    public async Task<string> CheckImageModelIsValid(ImageModel imageModel)
    {
        _httpClient.DefaultRequestHeaders.Add("X-API-KEY", _apiKey);
        _httpClient.Timeout = TimeSpan.FromSeconds(120);
        try
        {
            // Tạo MultipartFormDataC   ontent để gửi form-data
            using var formContent = new MultipartFormDataContent();

            // Đọc file thành stream
            using var stream = imageModel.ImageModelFile.OpenReadStream();
            using var streamContent = new StreamContent(stream);

            // Set content type cho file (tùy loại file)
            streamContent.Headers.ContentType =
                new System.Net.Http.Headers.MediaTypeHeaderValue(imageModel.ImageModelFile.ContentType);

            // Thêm file vào form-data với key là "input_image" (như trong Postman)
            formContent.Add(streamContent, "input_image", imageModel.ImageModelFile.FileName);

            // Nếu cần thêm các field khác (text, số, v.v.)
            // formContent.Add(new StringContent("value"), "key_name");

            // Gửi POST request
            var url = $"{_baseUrl}api/tryon/input_check/v1/model";
            var response = await _httpClient.PostAsync(url, formContent);

            // Kiểm tra response

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();

                // Parse và format lại JSON
                var jsonDocument = JsonDocument.Parse(result);
                var formattedJson = JsonSerializer.Serialize(jsonDocument, new JsonSerializerOptions
                {
                    WriteIndented = true // Format đẹp với indentation
                });

                return formattedJson;
            }
            else
            {
                var error = await response.Content.ReadAsStringAsync();
                throw new Exception($"API Error: {response.StatusCode} - {error}");
            }
        }
        catch (Exception ex)
        {
            throw new Exception($"Error calling FitRoom API: {ex.Message}", ex);
        }
    }

    public async Task<string> CreateTryOnTask(TryOnModel tryOnModel)
    {
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("X-API-KEY", _apiKey);
        _httpClient.Timeout = TimeSpan.FromSeconds(120);

        using var formData = new MultipartFormDataContent();

        Stream topStream = null;
        Stream bottomStream = null;

        try
        {
            if (tryOnModel.TopImage != null && tryOnModel.BottomImage != null)
            {
                topStream = await DownloadImageFromUrl(tryOnModel.TopImage.NoBgImgUrl);
                var topContent = new StreamContent(topStream);
                topContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
                formData.Add(topContent, "cloth_image", "top.jpg");

                bottomStream = await DownloadImageFromUrl(tryOnModel.BottomImage.NoBgImgUrl);
                var bottomContent = new StreamContent(bottomStream);
                bottomContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
                formData.Add(bottomContent, "lower_cloth_image", "bottom.jpg");

                formData.Add(new StringContent("combo"), "cloth_type");
                formData.Add(new StringContent("true"), "hd_mode");
            }
            else if (tryOnModel.TopImage != null)
            {
                topStream = await DownloadImageFromUrl(tryOnModel.TopImage.NoBgImgUrl);
                var topContent = new StreamContent(topStream);
                topContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
                formData.Add(topContent, "cloth_image", "top.jpg");

                if (tryOnModel.TopImage.Product.Category.BodyPart.Equals("Đầm", StringComparison.OrdinalIgnoreCase) ||
                    tryOnModel.TopImage.Product.Category.CategoryName.Equals("Đầm", StringComparison.OrdinalIgnoreCase))
                {
                    formData.Add(new StringContent("full_set"), "cloth_type");
                }
                else
                {
                    formData.Add(new StringContent("upper"), "cloth_type");
                }
            }
            else if (tryOnModel.BottomImage != null)
            {
                bottomStream = await DownloadImageFromUrl(tryOnModel.BottomImage.NoBgImgUrl);
                var bottomContent = new StreamContent(bottomStream);
                bottomContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
                formData.Add(bottomContent, "cloth_image", "bottom.jpg");
                formData.Add(new StringContent("lower"), "cloth_type");
            }

            var userStream = tryOnModel.UserModelImage.OpenReadStream();
            var userContent = new StreamContent(userStream);
            userContent.Headers.ContentType = new MediaTypeHeaderValue(tryOnModel.UserModelImage.ContentType);
            formData.Add(userContent, "model_image", tryOnModel.UserModelImage.FileName);

            // Gửi request
            var response = await _httpClient.PostAsync($"{_baseUrl}api/tryon/v2/tasks", formData);
            response.EnsureSuccessStatusCode();

            var responseString = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseString);
            string taskId = doc.RootElement.GetProperty("task_id").GetString();

            return taskId;
        }catch (Exception ex)
        {
            throw new Exception(ex.Message);
        }
        finally
        {
            topStream?.Dispose();
            bottomStream?.Dispose();
        }
    }


    public async Task<TaskTryOnResponse> GetTaskStatus(string taskId)
    {
        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("X-API-KEY", _apiKey);
        _httpClient.Timeout = TimeSpan.FromSeconds(120);
        
        var response = await _httpClient.GetAsync($"{_baseUrl}api/tryon/v2/tasks/{taskId}");
        response.EnsureSuccessStatusCode();
        
        var responseString = await response.Content.ReadAsStringAsync();

        // Parse JSON để lấy task_id
        using var doc = JsonDocument.Parse(responseString);
        var root = doc.RootElement;
        TaskTryOnResponse taskTryOnResponse = new TaskTryOnResponse();
        taskTryOnResponse.TaskId = taskId;
        string status = root.GetProperty("status").GetString();
        taskTryOnResponse.Status = status;
        if (status == "PROCESSING")
        {
            int process = root.GetProperty("progress").GetInt32();
            taskTryOnResponse.Progress = process;
        }else if (status == "COMPLETED")
        {
            int process = root.GetProperty("progress").GetInt32();
            taskTryOnResponse.Progress = process;
            string responseUrl = root.GetProperty("download_signed_url").GetString();
            taskTryOnResponse.DownloadSignedUrl = responseUrl;
        }else if(status == "FAILED")
        {
            string error = root.GetProperty("error").GetString();
            taskTryOnResponse.Error = error;
        }

        return taskTryOnResponse;
    }

    private async Task<MemoryStream> DownloadImageFromUrl(string url)
    {
        var httpClient = new HttpClient();
        var bytes = await httpClient.GetByteArrayAsync(url);
        return new MemoryStream(bytes);
    }
}