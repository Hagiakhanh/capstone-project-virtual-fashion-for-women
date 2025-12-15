using Microsoft.AspNetCore.SignalR;
using StackExchange.Redis;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
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
using VirtualTryonWomenFashion.Service.DTO.Mail;
using VirtualTryonWomenFashion.Service.DTO.Notification;
using VirtualTryonWomenFashion.Service.DTO.Order;
using VirtualTryonWomenFashion.Service.DTO.OrderDetail;
using VirtualTryonWomenFashion.Service.DTO.Transaction;
using VirtualTryonWomenFashion.Service.DTO.Wallet;
using VirtualTryonWomenFashion.Service.Helpers;
using VirtualTryonWomenFashion.Service.Hubs;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Mappers;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class TransactionService : ITransactionService
    {
        private readonly ITransactionRepository _transactionRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly IUserService _userService;
        private readonly IWalletService _walletService;
        private readonly IMailService _mailService;
        private readonly INotificationService _notificationService;
        private readonly IHubContext<NotificationHub> _notificationHub;

        public TransactionService(
            ITransactionRepository transactionRepository,
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService,
            IUserService userService,
            IWalletService walletService,
            IMailService mailService,
            INotificationService notificationService,
            IHubContext<NotificationHub> notificationHub
        )
        {
            _transactionRepository = transactionRepository;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _userService = userService;
            _walletService = walletService;
            _mailService = mailService;
            _notificationHub = notificationHub;
            _notificationService = notificationService;
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
                orderBy: t => t.OrderByDescending(x => x.UpdatedAt)
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

            TimeZoneInfo vnZone = TimeZoneInfo.FindSystemTimeZoneById("SE Asia Standard Time");
            DateTime nowVn = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, vnZone);

            // 1. Không cho phép ngày ở tương lai
            //DateTime now = DateTime.Now.AddHours(+7);
            DateTime? filterStartDate = startDate;
            DateTime? filterEndDate = endDate;

            if (filterStartDate.HasValue)
            {
                filterStartDate = TimeZoneInfo.ConvertTimeFromUtc(filterStartDate.Value, vnZone);
            }

            if (filterEndDate.HasValue)
            {
                filterEndDate = TimeZoneInfo.ConvertTimeFromUtc(filterEndDate.Value, vnZone);
            }

            if (filterStartDate.HasValue && filterStartDate.Value.Date > nowVn.Date)
            {
                filterStartDate = nowVn.Date;
            }

            if (filterEndDate.HasValue && filterEndDate.Value.Date > nowVn.Date)
            {
                filterEndDate = nowVn;
            }
            if (filterEndDate.HasValue)
            {
                filterEndDate = filterEndDate.Value.Date.AddDays(1); 
            }


            filter = t =>
                (string.IsNullOrEmpty(type) || t.Type == type) &&
                (string.IsNullOrEmpty(method) || t.Method == method) &&
                (string.IsNullOrEmpty(status) || t.Status == status) &&
                (!filterStartDate.HasValue || t.CreatedAt >= filterStartDate.Value) &&
                (!filterEndDate.HasValue || t.CreatedAt <= filterEndDate.Value);

            /*if (startDate.HasValue && startDate.Value > now)
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
                (!endDate.HasValue || t.CreatedAt < endDate.Value);*/


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

        public async Task<Pagination<ResponseWithDrawTransactionAdmin>> GetPendingWithDrawTransactions(bool isDescending, string status, PaginationParameter pagination)
        {
            List<Transaction> rawTransactions = await _transactionRepository.GetAll(
                pagination: pagination,
                filter: t => t.Type == TypeTransactionEnum.Withdraw.ToString() &&
                (string.IsNullOrEmpty(status) || t.Status == status),
                orderBy: t => isDescending ? t.OrderByDescending(t => t.CreatedAt) : t.OrderBy(t => t.CreatedAt),
                includes: t => t.User
                );

            int totalRecords = await _transactionRepository.CountAsync(
                t => t.Type == TypeTransactionEnum.Withdraw.ToString() &&
                (string.IsNullOrEmpty(status) || t.Status == status));
            List<ResponseWithDrawTransactionAdmin> responseTransactions = new List<ResponseWithDrawTransactionAdmin>();

            foreach (Transaction transaction in rawTransactions)
            {
                responseTransactions.Add(transaction.MapToResponseWithDrawTransactionAdmin());
            }

            return new Pagination<ResponseWithDrawTransactionAdmin>(responseTransactions, totalRecords,
                pagination.PageIndex, pagination.PageSize);
        }

        public async Task<bool> RefuseWithDrawTransaction(int transactionId)
        {
            int userId = _currentUserService.GetUserId();
            var currentUser = await _userService.GetUserById(userId);
            var transaction = await _transactionRepository.GetByIdAsync(transactionId);
            if (transaction == null)
            {
                throw new Exception("Giao dịch không tìm thấy");
            }

            if (transaction.Type != TypeTransactionEnum.Withdraw.ToString())
            {
                throw new Exception("Giao dịch này không phải là giao dịch rút tiền");
            }

            if (transaction.Status != TransactionStatusEnum.Pending.ToString())
            {
                throw new Exception("Giao dịch này đã được xử lý rồi");
            }
            if (currentUser.Role.RoleId != "Admin" && userId != transaction.UserId)
            {
                throw new Exception("Bạn không có quyền từ chối hoặc cancel cái giao dịch này");
            }

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                transaction.Status = TransactionStatusEnum.Failed.ToString();
                transaction.UpdatedAt = DateTime.UtcNow.AddHours(7);
                await _transactionRepository.UpdateAsync(transaction);
                await _walletService.UpdateBalanceInWalletAsync(new RequestUpdateRecharge
                {
                    Amount = transaction.Money.Value,
                    WalletId = transaction.WalletId.Value
                }, TypeTransactionEnum.Recharge.ToString());
                await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();
                return true;
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new Exception(ex.Message);
            }

        }

        public async Task<bool> AcceptWithDrawTransaction(int transactionId)
        {
            int userId = _currentUserService.GetUserId();
            var transaction = await _transactionRepository.GetByIdAsync(transactionId);
            if (transaction == null)
            {
                throw new Exception("Giao dịch không tìm thấy");
            }

            if (transaction.Type != TypeTransactionEnum.Withdraw.ToString())
            {
                throw new Exception("Giao dịch này không phải là giao dịch rút tiền");
            }

            if (transaction.Status != TransactionStatusEnum.Pending.ToString())
            {
                throw new Exception("Giao dịch này đã được xử lý rồi");
            }

            var ownerTransaction = await _userService.GetUserById(transaction.UserId);

            await _unitOfWork.BeginTransactionAsync();
            try
            {
                transaction.Status = TransactionStatusEnum.Success.ToString();
                transaction.UpdatedAt = DateTime.UtcNow.AddHours(7);
                await _transactionRepository.UpdateAsync(transaction);
                RequestCreateNotification requestNotification = new RequestCreateNotification()
                {
                    ReceiverId = transaction.UserId,
                    Title = "Giao dịch rút tiền ra khỏi ví đã được chấp nhận",
                    Content = $"Giao dịch rút tiền {transaction.ThirdPartyCode} với số tiền {transaction.Money} VNĐ đã được admin chấp nhận"
                };
                await _notificationService.CreateNotificationAsync(requestNotification);
                await _notificationHub.Clients.Group(transaction.UserId.ToString())
                    .SendAsync("ReceiveNotification", requestNotification.Title);
                _mailService.sendEmailAsync(new MailRequest
                {
                    ToEmail = ownerTransaction.Email,
                    Subject = $"[Women Fashion] Giao dịch rút tiền {transaction.ThirdPartyCode} đã được admin chấp nhận",
                    Body = MailContent.WithdrawRequestApproved(ownerTransaction.FullName, transaction.Money.Value, transaction.BankName, transaction.BankAccountNumber, transaction.ThirdPartyCode)
                });
                await _unitOfWork.SaveChanges();
                await _unitOfWork.CommitTransactionAsync();
                return true;
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                throw new Exception(ex.Message);
            }
        }
    }
}