using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.Characteristic
{
    public class RequestCreateUserCharacteristics
    {
        public decimal? Weight { get; set; }

        public int? Age { get; set; }

        public decimal? Height { get; set; }

        public string ColorPreference { get; set; }

        public string StyleType { get; set; }

        public string OccasionPreference { get; set; }

        public string SkinTone { get; set; }
    }
}
