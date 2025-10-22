using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Service.DTO.Product;

namespace VirtualTryonWomenFashion.Service.DTO.TryOnSlotModel
{
    public class TryOnResponse
    {
        public int TryOnSlotId { get; set; }

        public int CustomerId { get; set; }

        public string UploadImageUrl { get; set; }

        public string? OutputImageUrl { get; set; }

        public string OutputTaskId { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<ResponseProductDto> TryOnProductVariant { get; set; }
    }
}
