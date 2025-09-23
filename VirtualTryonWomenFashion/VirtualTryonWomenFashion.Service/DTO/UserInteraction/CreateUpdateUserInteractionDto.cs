using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.UserInteraction
{
    public class CreateUpdateUserInteractionDto
    {
        public string? ProductId { get; set; }
        public string? InteractionType { get; set; }
        public decimal? Weight { get; set; }
    }
}
