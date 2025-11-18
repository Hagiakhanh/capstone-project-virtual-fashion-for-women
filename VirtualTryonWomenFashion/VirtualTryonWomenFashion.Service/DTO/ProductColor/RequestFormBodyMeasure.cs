using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.ProductColor
{
    public class RequestFormBodyMeasure
    {
        public double Shoulder {  get; set; }
        public double Bust { get; set; }
        public double Waist { get; set; }
        public double Hips { get; set; }
        public double Length { get; set; }
        public string ProductColorId { get; set; }
        public int CategoryId { get; set; }
        
    }
}
