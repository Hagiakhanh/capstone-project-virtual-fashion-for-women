using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IColorService
    {
        public Task<List<Color>> GetAllAsync();
        public Task<MessageModelWithData<Color>> CreateColor(string colorName, string colorPrefix, string hexCode);
    }
}
