using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.Color
{
    public class CreateColorRequest
    {
        public string ColorName { get; set; }

        public string ColorPrefix { get; set; }

        public string HexCode { get; set; }
    }
}
