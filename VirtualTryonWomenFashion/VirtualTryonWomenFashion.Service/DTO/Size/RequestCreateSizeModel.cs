using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.Size
{
    public class RequestCreateSizeModel
    {
        public string SizeCode { get; set; }

        public double? MinHeight { get; set; }

        public double? MaxHeight { get; set; }

        public double? MinBust { get; set; }

        public double? MaxBust { get; set; }

        public double? MinWaist { get; set; }

        public double? MaxWaist { get; set; }

        public double? MinHips { get; set; }

        public double? MaxHips { get; set; }
    }
}
