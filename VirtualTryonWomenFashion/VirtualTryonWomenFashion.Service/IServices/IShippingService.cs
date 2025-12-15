using VirtualTryonWomenFashion.Service.Utils;

namespace VirtualTryonWomenFashion.Service.IServices;

public interface IShippingService
{
    public Task<int> GetProvinceId(string provinceName);
    public Task<int> GetDistrictId(string districtName, int provinceId);
    public Task<string> GetWardId(string wardName, int districtId);
    public Task<(decimal, decimal, string)> CalculateShippingFee(ShippingObjectRequest shippingObjectRequest);
    public Task<Dictionary<int, string>> GetProvinceName();
    public Task<Dictionary<int, string>> GetDistrictName(int provinceId);
    public Task<Dictionary<string, string>> GetWardName(int districtId);
}