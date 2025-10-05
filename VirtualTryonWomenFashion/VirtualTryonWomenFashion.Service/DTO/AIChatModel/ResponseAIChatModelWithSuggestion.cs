using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.AIChatModel
{
    public class ResponseAIChatModelWithSuggestion
    {
        public bool IsAiresponse { get; set; }

        public string Content { get; set; }

        public DateTime CreatedAt { get; set; }
        public List<ProductSuggestionDTO>? Components { get; set; } = new List<ProductSuggestionDTO>();
    }
}
