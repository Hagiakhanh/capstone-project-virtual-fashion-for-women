using Microsoft.AspNetCore.Http;
using VirtualTryonWomenFashion.Service.DTO.UploadImageModel;

namespace VirtualTryonWomenFashion.Service.IServices;

public interface IFitRoomService
{
    Task<string> CheckImageModelIsValid(ImageModel imageModel);
    Task<string> CreateTryOnTask(TryOnModel tryOnModel);
    Task<TaskTryOnResponse> GetTaskStatus(string taskId);
}