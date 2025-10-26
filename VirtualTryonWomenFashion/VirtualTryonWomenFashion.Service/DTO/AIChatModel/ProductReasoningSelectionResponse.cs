using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.AIChatModel
{
    internal class ProductReasoningSelectionResponse
    {
        [JsonPropertyName("selectedProducts")]
        public List<SelectedProduct> SelectedProducts { get; set; }

        [JsonPropertyName("responseText")]
        public string ResponseText { get; set; }
    }
    public class SelectedProduct
    {
        [JsonPropertyName("id")]
        public string Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("ImageUrl")]
        public string ImageUrl { get; set; }
        [JsonPropertyName("ProductSlug")]
        public string ProductSlug { get; set; }

        [JsonPropertyName("ProductColorId")]
        public string ProductColorId { get; set; }

        [JsonPropertyName("reason")]
        public string Reason { get; set; }
        [JsonPropertyName("productId")]
        public string ProductId { get; set; }
    }
}
