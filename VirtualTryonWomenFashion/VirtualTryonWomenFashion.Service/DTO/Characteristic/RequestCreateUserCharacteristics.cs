using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.Characteristic
{
    public class RequestCreateUserCharacteristics
    {
        public double? Weight { get; set; }

        public int? Age { get; set; }

        public double? Height { get; set; }

        public int? StyleTypeID { get; set; }

        public string StyleTypeNote { get; set; }

        public int? OccasionPreferenceID { get; set; }

        public string OccasionPreferenceNote { get; set; }
        public int? SkinToneID { get; set; }
        public string SkinToneNote { get; set; }
    }
}
