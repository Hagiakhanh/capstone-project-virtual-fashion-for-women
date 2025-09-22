using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.Rating
{
    public class CreateUpdateRatingDto
    {
        public int? RatingValue { get; set; }

        public string? Comment { get; set; }

        public int? OrderDetailId { get; set; }
    }
}
