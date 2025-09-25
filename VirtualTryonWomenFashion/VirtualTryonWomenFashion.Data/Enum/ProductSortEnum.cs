using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Data.Enum
{
    public enum ProductSortEnum
    {
        AZ,              // Sắp xếp theo ProductName từ A đến Z
        ZA,              // Sắp xếp theo ProductName từ Z đến A
        Newest,          // Sắp xếp theo CreatedDate giảm dần (Mới nhất)
        BestSelling,     // Sắp xếp theo tổng số lượng bán (Bán chạy)
        PriceAscending,  // Sắp xếp theo giá tăng
        PriceDescending  // Sắp xếp theo giá giảm
    }
}
