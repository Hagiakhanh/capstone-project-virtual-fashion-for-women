using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Wallet;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IWalletService
    {
        Task<Wallet> CreateWalletAsync();
        Task<ResponseWallet> GetWalletAsync(int? userId = null);
        Task<Wallet> GetWalletById(int walletId);
        Task<int> UpdateBalanceInWalletAsync(RequestUpdateRecharge requestUpdateRecharge, string type);
        Task HandleSuccesfulRecharge(List<RequestUpdateRecharge> requestUpdateRecharges);
    }
}
