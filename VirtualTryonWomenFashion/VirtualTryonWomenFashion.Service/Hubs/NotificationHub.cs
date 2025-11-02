using Microsoft.AspNetCore.SignalR;

namespace VirtualTryonWomenFashion.Service.Hubs;

public class NotificationHub : Hub
{
    public async Task JoinNotificationGroup(string userId)
    {
        try
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
            Console.WriteLine($"✅ {Context.ConnectionId} joined group {userId}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ JoinNotificationGroup error: {ex.Message}");
            throw;
        }
    }

    public async Task JoinNotificationStaffGroup()
    {
        try
        {

            await Groups.AddToGroupAsync(Context.ConnectionId, "StaffGroup");
            Console.WriteLine($"✅ {Context.ConnectionId} joined group StaffGroup");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ JoinNotificationStaffGroup error: {ex.Message}");
            throw;
        }
    }
}