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
    public interface ISkinToneService
    {
        public Task<List<SkinTone>> GetAllAsync();
        public Task<MessageModelWithData<SkinTone>> CreateAsync(string name, IFormFile imageFile);

    }
}
