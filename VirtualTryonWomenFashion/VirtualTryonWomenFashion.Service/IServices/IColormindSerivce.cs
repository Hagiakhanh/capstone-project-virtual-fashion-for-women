using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IColormindSerivce
    {
        Task<List<int>> GetListHexcodeRecommend(string hexcode);
    }
}
