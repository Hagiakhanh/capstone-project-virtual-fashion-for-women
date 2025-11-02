using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Enum;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Data.UnitOfWork;
using VirtualTryonWomenFashion.Service.DTO.Wallet;
using VirtualTryonWomenFashion.Service.IServices;
using VirtualTryonWomenFashion.Service.Mappers;

namespace VirtualTryonWomenFashion.Service.Services
{
    public class WalletService : IWalletService
    {
        private readonly IWalletRepository _walletRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;

        public WalletService(
            IWalletRepository walletRepository,
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService
        )
        {
            _walletRepository = walletRepository;
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
        }

        public async Task<Wallet> CreateWalletAsync()
        {
            Wallet newWallet = new Wallet
            {
                Balance = 0,
                CreatedDate = DateTime.UtcNow.AddHours(7),
            };
            await _walletRepository.InsertAsync(newWallet);
            await _unitOfWork.SaveChanges();
            return newWallet;
        }

        public async Task<ResponseWallet> GetWalletAsync(int? userId = null)
        {
            try
            {
                if(userId == null) userId = _currentUserService.GetUserId();
                Wallet? userWallet = await _walletRepository.GetWalletByUserIdAsync((int)userId);
                if (userWallet == null)
                {
                    throw new Exception("Người dùng này không tồn tại ví");
                }

                return userWallet.MapToResponseWallet();
            }
            catch (Exception ex)
            {
                throw new Exception("Lỗi khi lấy ví người dùng: " + ex.Message);
            }
        }

        public async Task<Wallet> GetWalletById(int walletId)
        {
            Wallet? existingWallet = await _walletRepository.GetByIdAsync(walletId);
            if (existingWallet == null)
            {
                throw new Exception("Không tìm thấy wallet");
            }

            return existingWallet;
        }

        public async Task<int> UpdateBalanceInWalletAsync(RequestUpdateRecharge requestUpdateRecharge, string type)
        {
            Wallet existingWallet = await this.GetWalletById(requestUpdateRecharge.WalletId);

            if (type == TypeTransactionEnum.Purchase.ToString())
            {
                if(existingWallet.Balance < requestUpdateRecharge.Amount)
                {
                    throw new Exception("Số dư trong ví không đủ để thực hiện giao dịch");
                }
                existingWallet.Balance -= requestUpdateRecharge.Amount;
            }else if (type == TypeTransactionEnum.Recharge.ToString())
            {
                existingWallet.Balance += requestUpdateRecharge.Amount;
            }
            await _walletRepository.UpdateAsync(existingWallet);
            return await _unitOfWork.SaveChanges();
        }

        public async Task HandleSuccesfulRecharge(List<RequestUpdateRecharge> requestUpdateRecharges)
        {
            var wallets =
                await _walletRepository.GetAllWalletsByIds(requestUpdateRecharges.Select(x => x.WalletId).ToList());
            foreach (var wallet in wallets)
            {
                wallet.Balance += requestUpdateRecharges.FirstOrDefault(w=>w.WalletId == wallet.WalletId).Amount;
            }

            await _walletRepository.UpdateRangeAsync(wallets);
            await _unitOfWork.SaveChanges();
        }
    }
}