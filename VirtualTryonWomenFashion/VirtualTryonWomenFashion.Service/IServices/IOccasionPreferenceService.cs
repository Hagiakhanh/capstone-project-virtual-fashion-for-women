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
    public interface IOccasionPreferenceService
    {
        public Task<List<OccasionPreference>> GetAllAsync();
        public Task<MessageModelWithData<OccasionPreference>> CreateAsync(string name, IFormFile imageFile);

    }
}
