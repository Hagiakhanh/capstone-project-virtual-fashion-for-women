using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Enum;

namespace VirtualTryonWomenFashion.Service.DTO.Product
{
    public class ProductSearchRequest
    {
        public string? ProductName { get; set; }
        public ProductSortEnum ProductSort {  get; set; }
    }
}
