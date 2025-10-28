using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.StatusLog;

namespace VirtualTryonWomenFashion.Service.Mappers
{
    public static class StatusLogMapper
    {
        public static StatusLog ToStatusLogFromRequest(this RequestCreateStatusLog requestCreateStatusLog)
        {
            return new StatusLog()
            {
                OrderId = requestCreateStatusLog.OrderId,
                Status = requestCreateStatusLog.Status,
                UpdateDate = requestCreateStatusLog.UpdateAt,
            };
        }
    }
}
