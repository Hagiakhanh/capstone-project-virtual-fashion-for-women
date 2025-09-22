using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.ProductVariant;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IProductVariantService
    {
        Task<ProductVariant?> GetProductVariantById(string id);
        Task<MessageModelWithData<ProductVariant>> CreateAsync(string productColorId, CreateProductVariantRequest request);
        Task<MessageModelWithData<ProductVariant>> UpdateAsync(string productVariantId, UpdateProductVariantRequest request, bool useExistingTransaction = false);
        Task<MessageModel> DeleteAsync(string productVariantId);
        Task<ResponseGetVariantPriceInfo> GetVariantPriceInfoAsync(string variantId);
        Task UpdateQuantityAsync(Dictionary<string, int> variantAdjustments);
    }
}
