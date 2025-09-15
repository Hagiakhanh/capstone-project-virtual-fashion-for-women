using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.Extensions
{
    public class PaginationParams
    {
        private int _pageSize = 1;
        private int _pageIndex = 1;

        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = (value < 1) ? 1 : value;
        }

        public int PageIndex
        {
            get => _pageIndex;
            set => _pageIndex = (value < 1) ? 1 : value; 
        }
    }
}
