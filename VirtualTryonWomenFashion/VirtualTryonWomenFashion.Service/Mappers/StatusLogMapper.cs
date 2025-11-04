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
        public static StatusLog MapToStatusLogFromRequest(this RequestCreateStatusLog requestCreateStatusLog)
        {
            return new StatusLog()
            {
                OrderId = requestCreateStatusLog.OrderId,
                Status = requestCreateStatusLog.Status,
                UpdateDate = requestCreateStatusLog.UpdateAt,
            };
        }
        
        public static ResponseStatusLog MapToResponseStatusLog(this StatusLog statusLog)
        {
            return new ResponseStatusLog()
            {
                StatusLogId = statusLog.StatusLogId,
                Status = statusLog.Status,
                UpdateDate = statusLog.UpdateDate,
            };
        }
    }
}
