using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Service.DTO.Order;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IOrderService
    {
        public Task<string> CreateOrderAsync(RequestCreateOrder requestCreateOrder);
        
    }
}
