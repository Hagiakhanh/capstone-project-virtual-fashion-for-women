using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.IServices;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly ITransactionRepository _transactionRepository;
        private readonly IUnitOfWork _unitOfWork;

        public TransactionService(
            ITransactionRepository transactionRepository,
            IUnitOfWork unitOfWork
        )
        {
            _transactionRepository = transactionRepository;
            _unitOfWork = unitOfWork;
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

        public async Task<int> UpdateTransactionStatusAsync(Transaction transaction)
        {
            try
            {
                await _transactionRepository.UpdateAsync(transaction);
                return await _unitOfWork.SaveChanges();
            }
            catch (Exception ex)
            {
                throw new Exception($"Lỗi khi cập nhật trạng thái của transaction: {ex.Message}");
            }
        }
    }
}