using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.StatusLog;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Mappers;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class StatusLogService : IStatusLogService
    {
        private readonly IStatusLogRepository _statusLogRepository;
        private readonly IUnitOfWork _unitOfWork;
        public StatusLogService(IStatusLogRepository statusLogRepository,
            IUnitOfWork unitOfWork)
        {
            _statusLogRepository = statusLogRepository;
            _unitOfWork = unitOfWork;
        }
        public async Task<int> CreateStatusLog(List<RequestCreateStatusLog> requestCreateStatusLogs)
        {
            List<StatusLog> newStatusLogs = requestCreateStatusLogs.Select(x => x.MapToStatusLogFromRequest()).ToList();
            await _statusLogRepository.AddRangeAsync(newStatusLogs);
            return await _unitOfWork.SaveChanges();
        }

    }
}
