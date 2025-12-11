using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.Category
{
    public class CategoryTemplateSizeResponse
    {
        public int TemplateId { get; set; }
        public int CategoryId { get; set; }
        public int? SizeId { get; set; }
        public string? SizeCode { get; set; }
        public string? BodyPart { get; set; }
        public double? MinShoulder { get; set; }
        public double? MaxShoulder { get; set; }
        public double? MinBust { get; set; }
        public double? MaxBust { get; set; }
        public double? MinWaist { get; set; }
        public double? MaxWaist { get; set; }
        public double? MinHips { get; set; }
        public double? MaxHips { get; set; }
    }
}
