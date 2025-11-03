using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Wallet;

namespace VirtualTryonWomenFashion.Service.Mappers;

public static class WalletMapper
{
    public static ResponseWallet MapToResponseWallet(this Wallet wallet)
    {
        return new ResponseWallet
        {
            WalletId = wallet.WalletId,
            Balance = wallet.Balance ?? 0m
        };
    }
}