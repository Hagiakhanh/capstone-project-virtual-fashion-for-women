using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.Helpers
{
    public class ColorHelper
    {
        private static readonly Regex HexRegex = new Regex(
       @"^#(?:[0-9a-fA-F]{3}){1,2}$|^#(?:[0-9a-fA-F]{4}){1,2}$",
       RegexOptions.Compiled
   );

        // Regex cho rgba(...) hoặc rgb(...)
        private static readonly Regex RgbaRegex = new Regex(
            @"^rgba?\(\s*(\d{1,3}\s*,\s*){2}\d{1,3}(\s*,\s*(0|1|0?\.\d+))?\s*\)$",
            RegexOptions.Compiled
        );

        public static bool IsValidColor(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return false;

            return HexRegex.IsMatch(input) || RgbaRegex.IsMatch(input);
        }
    }
}
