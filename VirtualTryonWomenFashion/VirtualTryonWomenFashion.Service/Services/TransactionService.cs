using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.Repositories;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.Order;
using VirtualTryonWomenFashion.Service.DTO.OrderDetail;
using VirtualTryonWomenFashion.Service.DTO.Transaction;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Mappers;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly ITransactionRepository _transactionRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public TransactionService(
            ITransactionRepository transactionRepository,
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService
        )
        {
            _transactionRepository = transactionRepository;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<int> CreateTransactionAsync(Transaction transaction)
        {
            try
            {
                await _transactionRepository.InsertAsync(transaction);
                return await _unitOfWork.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tạo transaction: {ex.Message}");
            }
        }

        public async Task<Transaction> GetTransactionByThirdPartyIdAsync(string thirdPartyId)
        {
            try
            {
                var exsitingTransaction = await _transactionRepository.GetTransactionByThirdPartyId(thirdPartyId);
                if (exsitingTransaction == null)
                {
                    throw new Exception("Transaction không tồn tại");
                }

                return exsitingTransaction;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tìm transaction theo thirdParty code: {ex.Message}");
            }
        }

        public async Task<int> UpdateTransactionStatusAsync(IEnumerable<Transaction> transaction)
        {
            try
            {
                await _transactionRepository.UpdateRangeAsync(transaction);
                return await _unitOfWork.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật trạng thái của transaction: {ex.Message}");
            }
        }

        public async Task<Transaction> GetTransactionByOrderIdAsync(int orderId)
        {
            try
            {
                var exsitingTransaction = await _transactionRepository.GetTransactionByOrderId(orderId);
                if (exsitingTransaction == null)
                {
                    throw new Exception("Transaction không tồn tại");
                }

                return exsitingTransaction;
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tìm transaction theo orderId code: {ex.Message}");
            }
        }

        public async Task<Pagination<TransactionInformation>> GetTransactionHistory(
            PaginationParameter paginationParameter, string transactionStatus, bool isDescending)
        {
            int userId = _currentUserService.GetUserId();
            List<Transaction> rawTransactions = await _transactionRepository.GetAll(
                filter: t => t.UserId == userId
                             && (t.Status == transactionStatus || string.IsNullOrEmpty(transactionStatus))
                             && t.Type == TypeTransactionEnum.Purchase.ToString(),
                pagination: paginationParameter,
                orderBy: t => isDescending ? t.OrderByDescending(x => x.UpdatedAt) : t.OrderBy(x => x.UpdatedAt)
            );
            int totalRecords = await _transactionRepository.CountAsync(t =>
                t.UserId == userId && (t.Status == transactionStatus || string.IsNullOrEmpty(transactionStatus)) && t.Type == TypeTransactionEnum.Purchase.ToString());
            List<TransactionInformation> responseTransactions = new List<TransactionInformation>();
            foreach (Transaction transaction in rawTransactions)
            {
                responseTransactions.Add(transaction.MapToTransactionInformation());
            }

            return new Pagination<TransactionInformation>(responseTransactions, totalRecords,
                paginationParameter.PageIndex, paginationParameter.PageSize);
        }

        public async Task<Pagination<TransactionInformation>> GetRechargeTransactionHistory(PaginationParameter paginationParameter)
        {
            int userId = _currentUserService.GetUserId();
            List<Transaction> rawTransactions = await _transactionRepository.GetAll(
                filter: t => t.UserId == userId
                             && t.WalletId != null,
                pagination: paginationParameter,
                orderBy: t =>t.OrderByDescending(x => x.UpdatedAt) 
            );
            int totalRecords = await _transactionRepository.CountAsync(t =>
                t.UserId == userId && t.WalletId != null);
            List<TransactionInformation> responseTransactions = new List<TransactionInformation>();
            foreach (Transaction transaction in rawTransactions)
            {
                responseTransactions.Add(transaction.MapToTransactionInformation());
            }

            return new Pagination<TransactionInformation>(responseTransactions, totalRecords,
                paginationParameter.PageIndex, paginationParameter.PageSize);
        }

        public async Task<List<Transaction>> GetAllPendingRechargeTransaction()
        {
            var pendingRechargeTransaction = await _transactionRepository.GetAll(
                filter: t =>
                    t.Type == TypeTransactionEnum.Recharge.ToString() &&
                    t.Status == TransactionStatusEnum.Pending.ToString()
            );
            return pendingRechargeTransaction;
        }

        public async Task<int> CreateListTransactionAsync(List<Transaction> transactionList)
        {
            try
            {
                await _transactionRepository.AddRangeAsync(transactionList);
                return await _unitOfWork.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi tạo list transaction: {ex.Message}");
            }
        }

        public async Task<Pagination<ResponseTransactionAdmin>> GetAllTransactions(
            string? type,
            string? status,
            string? method,
            DateTime? startDate,
            DateTime? endDate,
            PaginationParameter pagination)
        {
            Expression<Func<Transaction, bool>>? filter = null;

            if (startDate.HasValue && endDate.HasValue && startDate >= endDate)
            {
                throw new ArgumentException("Start date must be before end date");
            }

            // 1. Không cho phép ngày ở tương lai
            DateTime now = DateTime.Now.AddHours(+7);

            if (startDate.HasValue && startDate.Value > now)
            {
                startDate = now;
            }

            if (endDate.HasValue && endDate.Value > now)
            {
                endDate = now;
            }

            // 2. Bao gồm toàn bộ ngày endDate
            if (endDate.HasValue)
            {
                endDate = endDate.Value.Date.AddDays(1); // dùng < endDate để bao hết ngày
            }

            // Xây dựng filter động
            filter = t =>
                (string.IsNullOrEmpty(type) || t.Type == type) &&
                (string.IsNullOrEmpty(method) || t.Method == method) &&
                (string.IsNullOrEmpty(status) || t.Status == status) &&
                (!startDate.HasValue || t.CreatedAt >= startDate.Value) &&
                (!endDate.HasValue || t.CreatedAt < endDate.Value);

            
            // Gọi repository
            List<Transaction> rawResult = await _transactionRepository.GetAll(
                pagination: pagination,
                filter: filter,
                orderBy: q => q.OrderByDescending(t => t.CreatedAt),
                includes: t => t.User
            ); 
            
            int totalRecords = await _transactionRepository.CountAsync(filter);

            List<ResponseTransactionAdmin> responseTransactions = new List<ResponseTransactionAdmin>();
            foreach (Transaction transaction in rawResult)
            {
                responseTransactions.Add(transaction.MapToResponseTransactionAdmin());
            }

            return new Pagination<ResponseTransactionAdmin>(responseTransactions, totalRecords,
                pagination.PageIndex, pagination.PageSize);

        }

    }
}