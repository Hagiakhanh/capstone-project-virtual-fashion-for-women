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

        public async Task<Pagination<TransactionInformation>> GetTransactionHistory(PaginationParameter paginationParameter, string transactionStatus, bool isDescending)
        {
            int userId = _currentUserService.GetUserId();
            List<Transaction> rawTransactions = await _transactionRepository.GetAll(
                filter: t => t.UserId == userId && ( t.Status == transactionStatus || string.IsNullOrEmpty(transactionStatus)),
                pagination: paginationParameter,
                orderBy: t => isDescending?  t.OrderByDescending(x => x.UpdatedAt): t.OrderBy(x=>x.UpdatedAt)
                );
            int totalRecords = await _transactionRepository.CountAsync(t => t.UserId == userId && (t.Status == transactionStatus || string.IsNullOrEmpty(transactionStatus)));
            List<TransactionInformation> responseTransactions = new List<TransactionInformation>();
            foreach (Transaction transaction in rawTransactions)
            {
                responseTransactions.Add(transaction.MapToTransactionInformation());
            }
            return new Pagination<TransactionInformation>(responseTransactions, totalRecords, paginationParameter.PageIndex, paginationParameter.PageSize);
        }
    }
}