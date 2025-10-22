using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.TryOnSlotModel;

namespace VirtualTryonWomenFashion.Service.Mappers
{
    public static class TryOnSlotMapper
    {
        public static TryOnResponse ToMapTryOnResponse(this TryOnSlot tryOnSlot)
        {
            return new TryOnResponse()
            {
                CustomerId = tryOnSlot.CustomerId,
                OutputImageUrl = tryOnSlot.OutputImageUrl,
                OutputTaskId = tryOnSlot.OutputTaskId,
                TryOnSlotId = tryOnSlot.TryOnSlotId,
                UploadImageUrl = tryOnSlot.UploadImageUrl,
                UpdatedAt = tryOnSlot.UpdatedAt,
            };
        }
    }
}
