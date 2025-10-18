using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.TryOnSlotModel
{
    public class UpdateTryOnRequest
    {
        public int TryOnSlotId { get; set; }
        public string OutputImageUrl { get; set; }
    }
}
