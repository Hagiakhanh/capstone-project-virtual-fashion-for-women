using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.Category
{
    public class CreateCategoryRequest
    {
        public string CategoryName { get; set; }

        public string BodyPart { get; set; }
    }
}
