namespace VirtualTryonWomenFashion.Service.DTO.UploadImageModel;

public class TaskTryOnResponse
{
    public string TaskId { get; set; }
    public string Status { get; set; }
    public int? Progress { get; set; }
    public string? DownloadSignedUrl { get; set; }
    public string? Error { get; set; }
}