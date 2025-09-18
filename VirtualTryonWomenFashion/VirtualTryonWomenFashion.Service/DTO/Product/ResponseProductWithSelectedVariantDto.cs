using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Service.DTO.ProductColor;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;

namespace VirtualTryonWomenFashion.Service.DTO.Product
{
    public class ResponseProductWithSelectedVariantDto
    {
        public ResponseProductDto Product { get; set; }
        public ResponseProductVariantDto SelectedVariant { get; set; }
        public ResponseProductColorDto SelectedColor { get; set; }
    }
}
