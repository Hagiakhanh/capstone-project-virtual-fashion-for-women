using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface ICategoryService
    {
        public Task<List<Category>> GetAllCategories();
    }
}
