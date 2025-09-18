using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.Helpers
{
    public static class DateHelper
    {
        /// <summary>
        /// Kiểm tra khoảng thời gian hợp lệ (start <= end).
        /// </summary>
        /// <param name="start">Ngày bắt đầu</param>
        /// <param name="end">Ngày kết thúc</param>
        /// <returns>true nếu hợp lệ, false nếu ngược</returns>
        public static bool IsValidDateRange(DateOnly start, DateOnly end)
        {
            return start <= end;
        }

        /// <summary>
        /// Nếu khoảng thời gian không hợp lệ thì ném Exception.
        /// </summary>
        public static void EnsureValidDateRange(DateOnly start, DateOnly end)
        {
            if (start > end)
            {
                throw new ArgumentException("Ngày bắt đầu không được lớn hơn ngày kết thúc.");
            }
        }
    }
}
