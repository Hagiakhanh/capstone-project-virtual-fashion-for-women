using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.Rating
{
    public class ResponseRatingDto
    {
        public string UserName { get; set; }
        public int RatingId { get; set; }
        public int? RatingValue { get; set; }
        public string Comment { get; set; }
        public DateTime CreateAt { get; set; }
        public string ProductVariantName { get; set; }
    }
}
