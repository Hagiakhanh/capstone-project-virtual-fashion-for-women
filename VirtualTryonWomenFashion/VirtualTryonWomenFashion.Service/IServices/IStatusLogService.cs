using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.StatusLog;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IStatusLogService
    {
        Task<int> CreateStatusLog(List<RequestCreateStatusLog> requestCreateStatusLogs);
    }
}
