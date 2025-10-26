using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;

namespace VirtualTryonWomenFashion.Service.DTO.SuggestedOutfit
{
    public class ResponseSuggestedOutfitModel
    {
        public int SuggestedOutfitId { get; set; }

        public int AiconversationId { get; set; }

        public string UserStyleJson { get; set; }

        public string Reason { get; set; }

        public DateTime CreatedAt { get; set; }

        public virtual ICollection<ResponseProductVariantDto> ProductVariants { get; set; } = new List<ResponseProductVariantDto>();
    }
}
