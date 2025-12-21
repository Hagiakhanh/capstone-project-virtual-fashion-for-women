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
    public class ColorRecommendationService : IColorRecommendationSerivce
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
        "analogic-complement"
        };

        private const double SimilarColorThreshold = 50;

        private const double HarmoniousColorThreshold = 80;

        private const double ComplementaryColorThreshold = 100;
        public ColorRecommendationService(HttpClient httpClient,
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
            // FIX: Normalize hex - remove `#` và convert thành chữ hoa để đảm bảo nhất quán
            hex = hex.Replace("#", "").ToUpper();

            if (hex.Length != 6)
            {
                throw new Exception("Mã màu không đúng định dạng (phải có 6 ký tự)");
            }

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

        public async Task<List<int>> GetListHexcodeRecommendV2(string hexcode)
        {
            var inputRgb = HexToRgb(hexcode);
            var inputHsl = RgbToHsl(inputRgb.R, inputRgb.G, inputRgb.B);

            var allColors = await _colorRepository.GetAll();
            var recommendedColorIds = new HashSet<int>();

            foreach (var color in allColors)
            {
                var dbRgb = HexToRgb(color.HexCode);
                var dbHsl = RgbToHsl(dbRgb.R, dbRgb.G, dbRgb.B);

                double hueDiff = HueDifference(inputHsl.Hue, dbHsl.Hue);

                // 1️⃣ Điều kiện bắt buộc: harmony
                if (!IsHarmonious(hueDiff))
                    continue;

                recommendedColorIds.Add(color.ColorId);
            }

            // Deterministic output
            return recommendedColorIds
                .OrderBy(id => id)
                .ToList();
        }

        private static (double Hue, double Saturation, double Lightness) RgbToHsl(int r, int g, int b)
        {
            double rNorm = r / 255.0;
            double gNorm = g / 255.0;
            double bNorm = b / 255.0;

            double max = Math.Max(rNorm, Math.Max(gNorm, bNorm));
            double min = Math.Min(rNorm, Math.Min(gNorm, bNorm));
            double delta = max - min;

            double hue = 0;

            if (delta != 0)
            {
                if (max == rNorm)
                    hue = ((gNorm - bNorm) / delta) % 6;
                else if (max == gNorm)
                    hue = (bNorm - rNorm) / delta + 2;
                else
                    hue = (rNorm - gNorm) / delta + 4;

                hue *= 60;
                if (hue < 0) hue += 360;
            }

            double lightness = (max + min) / 2;
            double saturation = delta == 0
                ? 0
                : delta / (1 - Math.Abs(2 * lightness - 1));

            return (hue, saturation, lightness);
        }

        private static bool IsHarmonious(double hueDiff)
        {
            return
                hueDiff <= 5 ||                          // Monochrome
                (hueDiff >= 20 && hueDiff <= 40) ||      // Analogous
                (hueDiff >= 110 && hueDiff <= 130) ||    // Triad
                (hueDiff >= 170 && hueDiff <= 190);      // Complement
        }

        private static double HueDifference(double hue1, double hue2)
        {
            double diff = Math.Abs(hue1 - hue2);
            return Math.Min(diff, 360 - diff);
        }
    }
}
