using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class ColormindService : IColormindSerivce
    {
        private readonly string _baseUrl;
        private readonly HttpClient _httpClient;
        private readonly IColorRepository _colorRepository;
        private readonly string[] _modes = new[]
        {
            "monochrome",
            "monochrome-dark",
            "monochrome-light",
            "analogic",
            "complement",
            "analogic-complement",
            "triad",
            "quad"
        };
        public ColormindService(HttpClient httpClient, 
            IConfiguration configuration,
            IColorRepository colorRepository)
        {

            _httpClient = httpClient;
            _baseUrl = configuration["ColorApiSetting:BaseUrl"];
            _colorRepository = colorRepository;
        }
        public async Task<List<int>> GetListHexcodeRecommend(string hexcode)
        {
            hexcode = hexcode.Replace("#", "");

            var allColors = await _colorRepository.GetAll();
            var recommendedColorIds = new HashSet<int>();

            foreach (var mode in _modes)
            {
                var url = $"{_baseUrl}scheme?hex={hexcode}&mode={mode}&count=6&format=json";
                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                    continue;

                var result = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(result);

                if (!doc.RootElement.TryGetProperty("colors", out var colorsElement))
                    continue;

                foreach (var colorElement in colorsElement.EnumerateArray())
                {
                    var hexValue = colorElement
                        .GetProperty("hex")
                        .GetProperty("value")
                        .GetString();

                    if (string.IsNullOrEmpty(hexValue))
                        continue;

                    var (r, g, b) = HexToRgb(hexValue);

                    // Tìm màu gần nhất trong DB
                    var nearest = allColors
                        .Select(c => new
                        {
                            Color = c,
                            Distance = ColorDistance(
                                HexToRgb(c.HexCode),
                                (r, g, b)
                            )
                        })
                        .OrderBy(x => x.Distance)
                        .FirstOrDefault();

                    if (nearest != null)
                        recommendedColorIds.Add(nearest.Color.ColorId);
                }
            }

            return recommendedColorIds.Distinct().ToList();
        }

        private static (int R, int G, int B) HexToRgb(string hex)
        {
            if(!hex.StartsWith("#"))
            {
                throw new Exception("Mã màu không đúng");
            }
            hex = hex.Replace("#", "");
            int r = int.Parse(hex.Substring(0, 2), System.Globalization.NumberStyles.HexNumber);
            int g = int.Parse(hex.Substring(2, 2), System.Globalization.NumberStyles.HexNumber);
            int b = int.Parse(hex.Substring(4, 2), System.Globalization.NumberStyles.HexNumber);
            return (r, g, b);
        }

        private static double ColorDistance((int R, int G, int B) c1, (int R, int G, int B) c2)
        {
            return Math.Sqrt(
                Math.Pow(c1.R - c2.R, 2) +
                Math.Pow(c1.G - c2.G, 2) +
                Math.Pow(c1.B - c2.B, 2)
            );
        }
    }
}
