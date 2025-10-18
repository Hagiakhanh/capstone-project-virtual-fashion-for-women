using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.Characteristic
{
    public class RequestCreateTypeOfCharacteristic
    {
        public string Name { get; set; }
        public IFormFile ImageFile { get; set; }
    }
}
