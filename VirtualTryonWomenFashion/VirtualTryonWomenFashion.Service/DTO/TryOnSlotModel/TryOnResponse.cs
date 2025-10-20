using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.TryOnSlotModel
{
    public class TryOnResponse
    {
        public int TryOnSlotId { get; set; }

        public int CustomerId { get; set; }

        public string UploadImageUrl { get; set; }

        public string? OutputImageUrl { get; set; }

        public string OutputTaskId { get; set; }
    }
}
