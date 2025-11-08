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
    }

    public class TemplateDetailsModel
    {
        public int SizeId { get; set; }
        public double? MinShoulder { get; set; }
        public double? MaxShoulder { get; set; }
        public double? MinBust { get; set; }
        public double? MaxBust { get; set; }
        public double? MinWaist { get; set; }
        public double? MaxWaist { get; set; }
        public double? MinHips { get; set; }
        public double? MaxHips { get; set; }
    }

    public class RequestCreateCategoryTemplatesModel
    {
        public int CategoryId { get; set; }
        public List<TemplateDetailsModel> Templates { get; set; } = new List<TemplateDetailsModel>();
    }

    public class RequestUpdateCategoryTemplatesModel
    {
        public List<TemplateDetailsModel> Templates { get; set; } = new List<TemplateDetailsModel>();
    }
}
