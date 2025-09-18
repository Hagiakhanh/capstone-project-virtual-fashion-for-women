using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Product;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IProductService
    {
        Task<MessageModelWithData<Product>> CreateProductAsyncWithValidation(CreateProductRequest request);
        Task<ResponseProductDto> GetProductBySlugAsync(string slug);
    }
}
