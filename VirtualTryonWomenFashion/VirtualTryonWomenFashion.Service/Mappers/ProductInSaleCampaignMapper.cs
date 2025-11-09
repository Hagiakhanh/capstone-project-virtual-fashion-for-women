using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.ProductInSaleCampaign;

namespace VirtualTryonWomenFashion.Service.Mappers
{
    public static class ProductInSaleCampaignMapper
    {
        public static ResponseGetProductInSaleCampaign MapToResponseGetProductInSaleCampaign(this ProductInSaleCampaign model)
        {

            if (model == null) return null;

            var productMapper = new ProductMapper();

            return new ResponseGetProductInSaleCampaign
            {
                ProductId = model.ProductId,
                PercentDiscount = model.PercentDiscount,
                SalePrice = model.SalePrice,
                Product = model.Product != null
                          ? productMapper.MapToResponseProductDto(model.Product, model.SalePrice.Value)
                          : null
            };
        }
    }
}
