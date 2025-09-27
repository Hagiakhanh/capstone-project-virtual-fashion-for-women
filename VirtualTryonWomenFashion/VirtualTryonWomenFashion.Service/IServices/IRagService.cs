
namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IRagService
    {
        Task<string> GetChatResponseAsync(string requestMessage);
    }
}
