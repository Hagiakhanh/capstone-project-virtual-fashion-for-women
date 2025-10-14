using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IStyleTypeService
    {
        public Task<List<StyleType>> GetAllAsync();
        public Task<MessageModelWithData<StyleType>> CreateAsync(string name, IFormFile imageFile);

    }
}
