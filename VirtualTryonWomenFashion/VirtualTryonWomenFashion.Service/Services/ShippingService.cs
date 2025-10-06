using System.Text.Json;
using Microsoft.Extensions.Configuration;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Utils;

namespace VirtualTryonWomenFashion.Service.Services;

public class ShippingService : IShippingService
{
    private readonly HttpClient _client;
    private readonly string _token;
    private readonly string _tokenProduction;
    private readonly string _shopId;

    public ShippingService(HttpClient httpClient, IConfiguration configuration)
    {
        _client = httpClient;
        _token = configuration["GHNSetttings:Token"];
        _shopId = configuration["GHNSetttings:ShopId"];
        _tokenProduction = configuration["GHNSetttings:TokenProduction"];
    }
    public async Task<int> GetProvinceId(string provinceName)
    {
        try
        {
            if (!_client.DefaultRequestHeaders.Contains("Token"))
            {
                _client.DefaultRequestHeaders.Add("Token", _token);
            }

            var response = await _client.GetAsync(
                "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/province"
            );

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception("Không thể truy xuất các tỉnh từ API GHN.");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseContent);

            var provinces = doc.RootElement.GetProperty("data");

            foreach (var province in provinces.EnumerateArray())
            {
                int provinceId = province.GetProperty("ProvinceID").GetInt32();
                string provinceNameJson = province.GetProperty("ProvinceName").GetString();

                if (string.Equals(provinceNameJson, provinceName, StringComparison.OrdinalIgnoreCase))
                {
                    return provinceId;
                }

                if (province.TryGetProperty("NameExtension", out var nameExtensions))
                {
                    foreach (var ext in nameExtensions.EnumerateArray())
                    {
                        if (string.Equals(ext.GetString(), provinceName, StringComparison.OrdinalIgnoreCase))
                        {
                            return provinceId;
                        }
                    }
                }
            }

            // Nếu không tìm thấy
            throw new Exception($"{provinceName} không tìm thấy.");
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            throw;
        }
    }

    public async Task<int> GetDistrictId(string districtName, int provinceId)
    {
        try
        {
            if (!_client.DefaultRequestHeaders.Contains("Token"))
            {
                _client.DefaultRequestHeaders.Add("Token", _token);
            }

            var requestBody = new
            {
                province_id = provinceId
            };
            var jsonRequestBody = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonRequestBody, System.Text.Encoding.UTF8, "application/json");

            var response = await _client.PostAsync(
                "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/district",
                content
            );

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception("Không thể lấy được quận/huyện từ API GHN.");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseContent);

            var districts = doc.RootElement.GetProperty("data");

            foreach (var district in districts.EnumerateArray())
            {
                int districtId = district.GetProperty("DistrictID").GetInt32();
                string districtNameJson = district.GetProperty("DistrictName").GetString();

                if (string.Equals(districtNameJson, districtName, StringComparison.OrdinalIgnoreCase))
                {
                    return districtId;
                }

                if (district.TryGetProperty("NameExtension", out var nameExtensions))
                {
                    foreach (var ext in nameExtensions.EnumerateArray())
                    {
                        if (string.Equals(ext.GetString(), districtName, StringComparison.OrdinalIgnoreCase))
                        {
                            return districtId;
                        }
                    }
                }
            }

            // Nếu không tìm thấy
            throw new Exception($"Province '{districtName}' not found.");
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            throw;
        }
    }

    public async Task<string> GetWardId(string wardName, int districtId)
    {
        try
        {
            if (!_client.DefaultRequestHeaders.Contains("Token"))
            {
                _client.DefaultRequestHeaders.Add("Token", _token);
            }

            var requestBody = new
            {
                district_id = districtId
            };
            var jsonRequestBody = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonRequestBody, System.Text.Encoding.UTF8, "application/json");

            var response = await _client.PostAsync(
                "https://dev-online-gateway.ghn.vn/shiip/public-api/master-data/ward",
                content
            );

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception("Failed to retrieve wards from GHN API.");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseContent);

            var wards = doc.RootElement.GetProperty("data");

            foreach (var ward in wards.EnumerateArray())
            {
                string wardCode = ward.GetProperty("WardCode").ToString();
                string wardNameJson = ward.GetProperty("WardName").GetString();

                if (string.Equals(wardNameJson, wardName, StringComparison.OrdinalIgnoreCase))
                {
                    return wardCode;
                }

                if (ward.TryGetProperty("NameExtension", out var nameExtensions))
                {
                    foreach (var ext in nameExtensions.EnumerateArray())
                    {
                        if (string.Equals(ext.GetString(), wardName, StringComparison.OrdinalIgnoreCase))
                        {
                            return wardCode;
                        }
                    }
                }
            }

            // Nếu không tìm thấy
            throw new Exception($"Province '{wardName}' not found.");
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            throw;
        }
    }

    public async Task<(decimal, decimal)> CalculateShippingFee(ShippingObjectRequest shippingObjectRequest)
    {
        try
        {
            if (!_client.DefaultRequestHeaders.Contains("Token"))
            {
                _client.DefaultRequestHeaders.Add("Token", _token);
            }
            if (!_client.DefaultRequestHeaders.Contains("ShopId"))
            {
                _client.DefaultRequestHeaders.Add("ShopId", _shopId);
            }
            var jsonRequestBody = JsonSerializer.Serialize(shippingObjectRequest);
            var content = new StringContent(jsonRequestBody, System.Text.Encoding.UTF8, "application/json");
            var response = await _client.PostAsync(
                "https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
                content
            );
            if (!response.IsSuccessStatusCode)
            {
                throw new Exception("Failed to retrieve free services from GHN API.");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseContent);

            var data = doc.RootElement.GetProperty("data");
            decimal serviceFee = 0;

            if (data.TryGetProperty("service_fee", out var serviceFeeElement)
                && serviceFeeElement.ValueKind == JsonValueKind.Number)
            {
                serviceFee = serviceFeeElement.GetDecimal();
            }
            decimal insuranceFee = 0;

            if (data.TryGetProperty("insurance_fee", out var insuranceFeeeElement)
                && serviceFeeElement.ValueKind == JsonValueKind.Number)
            {
                insuranceFee = insuranceFeeeElement.GetDecimal();
            }

            return (serviceFee, insuranceFee);
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            throw;
        }
    }

    public async Task<Dictionary<int, string>> GetProvinceName()
    {
        try
        {
            Dictionary<int, string> provinceName = new Dictionary<int, string>();
            
            var clientProduct = new HttpClient();
            clientProduct.DefaultRequestHeaders.Add("Token", _tokenProduction);

            var response = await clientProduct.GetAsync(
                "https://online-gateway.ghn.vn/shiip/public-api/master-data/province"
            );

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception("Không thể truy xuất các tỉnh từ API GHN.");
            }
            var responseContent = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseContent);

            var provinces = doc.RootElement.GetProperty("data");

            foreach (var province in provinces.EnumerateArray())
            {
                int provinceId = province.GetProperty("ProvinceID").GetInt32();
                string provinceNameJson = province.GetProperty("ProvinceName").GetString();
                provinceName.Add(provinceId, provinceNameJson);
            }
            return provinceName;
        }
        catch (Exception e)
        {
            Console.WriteLine($"Lỗi khi lấy tên thành phố: {e.Message}");
            throw;
        }
    }

    public async Task<Dictionary<int, string>> GetDistrictName(int provinceId)
    {
        try
        {
            Dictionary<int, string> districtName = new Dictionary<int, string>();
            
            var clientProduct = new HttpClient();
            clientProduct.DefaultRequestHeaders.Add("Token", _tokenProduction);

            var requestBody = new
            {
                province_id = provinceId
            };
            var jsonRequestBody = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonRequestBody, System.Text.Encoding.UTF8, "application/json");

            var response = await clientProduct.PostAsync(
                "https://online-gateway.ghn.vn/shiip/public-api/master-data/district",
                content
            );

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception("Không thể lấy được quận/huyện từ API GHN.");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseContent);

            var districts = doc.RootElement.GetProperty("data");

            foreach (var district in districts.EnumerateArray())
            {
                int districtId = district.GetProperty("DistrictID").GetInt32();
                string districtNameJson = district.GetProperty("DistrictName").GetString();
                int status = district.GetProperty("Status").GetInt32();
                
                if(status == 1)
                {
                    districtName.Add(districtId, districtNameJson);
                }
            }
            return districtName;
        }
        catch (Exception e)
        {
            Console.WriteLine($"Lỗi khi lấy tên thành phố: {e.Message}");
            throw;
        }
    }

    public async Task<Dictionary<string, string>> GetWardName(int districtId)
    {
        try
        {
            Dictionary<string, string> wardName = new Dictionary<string, string>();

            var clientProduct = new HttpClient();
            clientProduct.DefaultRequestHeaders.Add("Token", _tokenProduction);

            var requestBody = new
            {
                district_id = districtId
            };
            var jsonRequestBody = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonRequestBody, System.Text.Encoding.UTF8, "application/json");

            var response = await clientProduct.PostAsync(
                "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward",
                content
            );

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception("Không thể lấy được quận/huyện từ API GHN.");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseContent);

            var wards = doc.RootElement.GetProperty("data");

            foreach (var ward in wards.EnumerateArray())
            {
                string wardCode = ward.GetProperty("WardCode").ToString();
                string wardNameJson = ward.GetProperty("WardName").GetString();
                int status = ward.GetProperty("Status").GetInt32();

                if (status == 1)
                {
                    wardName.Add(wardCode,wardNameJson);
                }
            }
            return wardName;
        }
        catch (Exception e)
        {
            Console.WriteLine($"Lỗi khi lấy tên thành phố: {e.Message}");
            throw;
        }
    }
}