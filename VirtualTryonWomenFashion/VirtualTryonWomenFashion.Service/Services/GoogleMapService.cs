using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class GoogleMapService : IGoogleMapService
    {
        private readonly HttpClient _client;
        private readonly string _googleMapApi;

        public GoogleMapService(HttpClient client, IConfiguration configuration)
        {
            _client = client;
            _googleMapApi = configuration["GoogleMap:ApiKey"];
        }


        public async Task<Dictionary<string, string>> GetAutoCompleteLocation(string address)
        {
            Dictionary<string, string> result = new Dictionary<string, string>();
            var requestBody = $@"
        {{
            ""input"": ""{address}"",
            ""languageCode"": ""vi"",
            ""locationRestriction"": {{
                ""rectangle"": {{
                    ""low"": {{ ""latitude"": 8.1790665, ""longitude"": 102.14441 }},
                    ""high"": {{ ""latitude"": 23.392611, ""longitude"": 109.464638 }}
                }}
            }}
        }}";

            var request = new HttpRequestMessage(HttpMethod.Post, "https://places.googleapis.com/v1/places:autocomplete");
            request.Headers.Add("X-Goog-Api-Key", _googleMapApi);
            request.Headers.Add("X-Goog-FieldMask", "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.structuredFormat");
            request.Content = new StringContent(requestBody, Encoding.UTF8, "application/json");

            var response = await _client.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                throw new Exception("Không thể lấy được quận/huyện từ API GHN.");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseContent);
            if (doc.RootElement.TryGetProperty("suggestions", out var suggestions))
            {
                foreach (var suggestion in suggestions.EnumerateArray())
                {
                    var placePrediction = suggestion.GetProperty("placePrediction");

                    string placeId = placePrediction.GetProperty("placeId").GetString();

                    string description = placePrediction
                        .GetProperty("text")
                        .GetProperty("text")
                        .GetString();

                    if (!string.IsNullOrEmpty(placeId) && !result.ContainsKey(placeId))
                    {
                        result.Add(placeId, description);
                    }
                }
            }

            return result;
        }

        public async Task<object> GetPlaceDetail(string placeId)
        {
            var request = new HttpRequestMessage(HttpMethod.Get, $"https://places.googleapis.com/v1/places/{placeId}");
            request.Headers.Add("X-Goog-Api-Key", _googleMapApi);
            request.Headers.Add("Accept-Language", "vi");
            request.Headers.Add("X-Goog-FieldMask", "formattedAddress,postalAddress");

            var response = await _client.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception("Không thể lấy được quận/huyện từ API GHN.");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseContent);
            var result = new object();
            if (doc.RootElement.TryGetProperty("postalAddress", out var postalAddress))
            {
                var administrativeArea = postalAddress.GetProperty("administrativeArea").GetString(); // Lấy thành phố
                var locality = postalAddress.GetProperty("locality").GetString(); // Lấy quận 
                var sublocality = postalAddress.GetProperty("sublocality").GetString(); // Lấy phường 
                result = new {
                    ProvinceName = administrativeArea,
                    DistrictName = locality,
                    WardName = sublocality
                };
            }
            return result;
        }
    }
}
