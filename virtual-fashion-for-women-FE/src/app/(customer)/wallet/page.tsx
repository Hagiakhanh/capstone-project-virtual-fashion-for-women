'use client';
import React, { useEffect, useState } from 'react';
import {
    Wallet,
    Plus,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    CheckCircle2,
    XCircle,
    Send,
} from 'lucide-react';
import MomoPng from '../../../assets/payment/momo.png';
import VnpayPng from '../../../assets/payment/vnpay.png';
import { PaginationDTO } from '@/models/PaginationDTO';
import { WalletDTO } from '@/models/WalletDTO';
import { messageToast } from '@/helpers/toastHelper';
import { api } from '@/api/instance';
import formatPrice from '@/utils/formatPrice';
import LoadingOverlay from '@/components/Loading/LoadingOverlay';
import { useRouter } from 'next/navigation';
import { TransactionInformation } from '@/models/TransactionInformation';
import formatDate from '@/utils/formatDate';
import { BankResponse } from '@/models/BankResponse';

export default function WalletPage() {
    const router = useRouter();
    const [wallet, setWallet] = useState<WalletDTO>();
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState<number>(0);
    const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
    const [selectedBank, setSelectedBank] = useState<BankResponse | null>(null);
    const [bankSearchQuery, setBankSearchQuery] = useState<string>('');
    const [showBankDropdown, setShowBankDropdown] = useState(false);
    const [bankAccountNumber, setBankAccountNumber] = useState<string>('');
    const [selectedMethod, setSelectedMethod] = useState<'Momo' | 'VnPay' | null>(null);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState<PaginationDTO>({
        CurrentPage: 1,
        HasNext: false,
        HasPrevious: false,
        PageSize: 5,
        TotalCount: 0,
        TotalPages: 0,
    });
    const [rechargeTransactions, setRechargeTransactions] = useState<TransactionInformation[]>([]);
    const [showTransactionDetailModal, setShowTransactionDetailModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionInformation | null>(null);
    const [cancellingTransaction, setCancellingTransaction] = useState(false);
    const [banks, setBanks] = useState<BankResponse[]>([]);

    // Fetch danh sách ngân hàng từ API
    const fetchBanks = async () => {
        try {
            const response = await api.get("/payment/bank"); // Thay đổi endpoint nếu cần
            if (response.status === 200) {
                const banksData = response.data;
                console.log('Danh sách ngân hàng:', banksData);
                // Sort theo tên
                banksData.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
                setBanks(banksData);
            }
        } catch (error) {
            console.error('Lỗi khi lấy danh sách ngân hàng:', error);
            messageToast.error('Không thể tải danh sách ngân hàng');
        }
    };

    type TransactionStatus = 'Success' | 'Failed' | 'Pending';
    const styles: Record<TransactionStatus, {
        icon: React.ElementType;
        color: string;
        bg: string;
        text: string;
    }> = {
        Success: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', text: 'Thành công' },
        Failed: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', text: 'Thất bại' },
        Pending: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', text: 'Đang xử lý' },
    };

    const fetchWallet = async () => {
        try {
            const response = await api.get("/wallet");
            if (response.status === 200) {
                setWallet(response.data);
            }
        } catch (error: any) {
            console.error('Lỗi khi lấy thông tin ví:', error);
            messageToast.error(error.response?.data?.message);
        }
    }

    const fetchRechargeTransactions = async () => {
        try {
            setLoading(true);
            fetchWallet();
            const payloadPagination = {
                pageSize: pagination.PageSize,
                pageNumber: pagination.CurrentPage,
            }
            const response = await api.get('/transaction/recharge-history', { params: payloadPagination });
            if (response.status === 200) {
                setRechargeTransactions(response.data.data);
                setPagination((prev) => ({
                    ...prev,
                    ...response.data.pagination
                }));
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu nạp tiền:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async () => {
        if (!depositAmount || !selectedMethod) return;
        if (depositAmount < 10000 || depositAmount > 50000000) {
            messageToast.error('Số tiền nạp tối thiểu là 10.000đ và tối đa là 50.000.000đ');
            return;
        }
        try {
            setShowDepositModal(false);
            setDepositAmount(0);
            setSelectedMethod(null);
            setLoading(true);
            const payload = {
                walletId: wallet?.walletId,
                amount: depositAmount,
                paymentMethod: selectedMethod,
            }
            const response = await api.post("/payment/recharge", payload);
            if (response.status === 200) {
                const paymentURL = response.data;
                router.push(paymentURL);
            }
        } catch (error: any) {
            console.error('Lỗi khi xử lý nạp tiền:', error);
            messageToast.error(error.response?.data?.message);
        } finally {
            setShowDepositModal(false);
            setDepositAmount(0);
            setSelectedMethod(null);
            setLoading(false);
        }
    };

    const handleWithdraw = async () => {
        if (!withdrawAmount || !selectedBank || !bankAccountNumber) return;
        if (withdrawAmount < 10000 || withdrawAmount > wallet?.balance!) {
            messageToast.error(`Số tiền rút tối thiểu là 10.000đ và tối đa là ${formatPrice(wallet?.balance ?? 0)}đ`);
            return;
        }

        try {
            setShowWithdrawModal(false);
            setLoading(true);
            const payload = {
                walletId: wallet?.walletId,
                amount: withdrawAmount,
                bankName: selectedBank.name,
                bankAccountNumber: bankAccountNumber,
            }
            const response = await api.post("/payment/withdraw", payload);
            if (response.status === 200) {
                messageToast.success('Yêu cầu rút tiền đã được gửi');
                resetWithdrawForm();
                await fetchRechargeTransactions();
            }
        } catch (error: any) {
            console.error('Lỗi khi xử lý rút tiền:', error);
            messageToast.error(error.response?.data?.message);
        } finally {
            setShowWithdrawModal(false);
            setLoading(false);
            resetWithdrawForm();
        }
    };

    const handleCancelWithdraw = async () => {
        if (!selectedTransaction) return;
        try {
            setCancellingTransaction(true);
            const response = await api.post(`/transaction/${selectedTransaction.transactionId}/refuse`);
            if (response.status === 200) {
                messageToast.success('Hủy giao dịch rút tiền thành công');
                setShowTransactionDetailModal(false);
                await fetchRechargeTransactions();
            }
        } catch (error: any) {
            console.error('Lỗi khi hủy giao dịch:', error);
            messageToast.error(error.response.data);
        } finally {
            setCancellingTransaction(false);
        }
    };

    const resetWithdrawForm = () => {
        setWithdrawAmount(0);
        setSelectedBank(null);
        setBankAccountNumber('');
        setBankSearchQuery('');
        setShowBankDropdown(false);
    };

    const getStatusIcon = (status: string) => {
        const key = (['Success', 'Failed', 'Pending'].includes(status)
            ? status
            : 'Pending') as TransactionStatus;

        const { icon: Icon, color, text } = styles[key];

        return {
            icon: <Icon className={`w-4 h-4 md:w-8 md:h-8 ${color}`} />,
            text,
            status: key
        };
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.TotalPages) {
            setPagination((prev) => ({ ...prev, CurrentPage: newPage }));
        }
    };

    function getPageNumbers(totalPages: number, currentPage: number, delta = 2): (number | string)[] {
        const range: (number | string)[] = [];
        const left = Math.max(2, currentPage - delta);
        const right = Math.min(totalPages - 1, currentPage + delta);
        range.push(1);
        if (left > 2) {
            range.push("...");
        }
        for (let i = left; i <= right; i++) {
            range.push(i);
        }
        if (right < totalPages - 1) {
            range.push("...");
        }
        if (totalPages > 1) {
            range.push(totalPages);
        }
        return range;
    }

    const typeTransaction = (type: string) => {
        switch (type) {
            case 'Recharge':
                return 'Nạp tiền';
            case 'Refund':
                return 'Hoàn tiền';
            case 'Purchase':
                return 'Mua hàng';
            case 'Withdraw':
                return 'Rút tiền';
            default:
                return 'Khác';
        }
    }

    const filteredBanks = banks.filter(bank =>
        bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase()) ||
        bank.shortName.toLowerCase().includes(bankSearchQuery.toLowerCase())
    );

    const selectedBankData = banks.find(b => b.bankCode === selectedBank?.bankCode);

    useEffect(() => {
        fetchRechargeTransactions();
        fetchBanks();
    }, [pagination.CurrentPage, pagination.PageSize]);


    return (
        <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 py-6 md:py-10 px-3 md:px-6">
            <div className="mx-auto grid grid-cols-1 lg:grid-cols-[3fr_7fr] gap-4 md:gap-8">
                {loading && <LoadingOverlay />}

                {/* Left: Wallet Info - Responsive */}
                <div className="space-y-4 md:space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-xl flex items-center justify-center shadow-md">
                            <Wallet className="w-5 h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">Ví của tôi</h1>
                            <p className="text-xs md:text-sm text-gray-500">Quản lý tài chính cá nhân</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/90 to-indigo-500/90 rounded-2xl p-6 md:p-8 text-white shadow-lg">
                        <p className="text-blue-100 text-xs md:text-sm mb-2">Số dư khả dụng</p>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6">{formatPrice(wallet?.balance ?? 0)}đ</h2>

                        <div className="flex gap-3 md:gap-4">
                            <button
                                onClick={() => setShowDepositModal(true)}
                                className="flex-1 bg-white text-blue-600 py-2.5 md:py-3 rounded-xl font-medium hover:bg-blue-50 transition-all shadow-sm text-sm md:text-base"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Plus className="w-4 h-4" /> Nạp tiền
                                </div>
                            </button>

                            <button
                                onClick={() => setShowWithdrawModal(true)}
                                className="flex-1 bg-white/20 text-white py-2.5 md:py-3 rounded-xl font-medium hover:bg-white/30 transition-all shadow-sm text-sm md:text-base border border-white/30"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Send className="w-4 h-4" /> Rút tiền
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Transaction History - Responsive */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="p-4 md:p-6 border-b border-gray-100">
                        <h3 className="text-base md:text-lg font-semibold text-gray-800">Lịch sử giao dịch</h3>
                    </div>

                    <div className="flex flex-col justify-between">
                        <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
                            {rechargeTransactions.length > 0 ? (
                                rechargeTransactions.map((t) => {
                                    const statusInfor = getStatusIcon(t.status);
                                    return (
                                        <div
                                            key={t.transactionId}
                                            className="p-4 md:p-5 hover:bg-gray-50 transition-colors flex items-center justify-between gap-3"
                                        >
                                            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                                <div
                                                    className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${t.type === 'Recharge' || t.type === 'Refund' ? 'bg-green-50' : 'bg-red-50'
                                                        }`}
                                                >
                                                    {t.type === 'Recharge' || t.type === 'Refund' ? (
                                                        <ArrowDownLeft className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                                                    ) : (
                                                        <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-800 text-sm md:text-base truncate">
                                                        {typeTransaction(t.type)}
                                                    </p>
                                                    <p className="text-xs md:text-sm text-gray-500 truncate">
                                                        Ví • {formatDate(t.updatedAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0 flex items-center gap-2">
                                                <div>
                                                    <p
                                                        className={`text-sm md:text-base font-semibold ${t.type === 'Recharge' || t.type === 'Refund' ? 'text-green-600' : 'text-red-600'
                                                            }`}
                                                    >
                                                        {t.type === 'Recharge' || t.type === 'Refund' ? '+' : '-'}
                                                        {formatPrice(t.money)}
                                                    </p>
                                                    <div className="flex items-center gap-1 justify-end mt-1">
                                                        {statusInfor.icon}
                                                        <span className="text-xs md:text-sm text-gray-600">
                                                            {statusInfor.text}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedTransaction(t);
                                                        setShowTransactionDetailModal(true);
                                                    }}
                                                    className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600"
                                                    title="Xem chi tiết"
                                                >
                                                    <svg
                                                        className="w-4 h-4 md:w-5 md:h-5"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col justify-center items-center h-full text-gray-500 py-12 md:py-20">
                                    <Clock className="w-6 h-6 md:w-8 md:h-8 mb-2 text-gray-400" />
                                    <p className="text-sm md:text-base font-medium">Không có giao dịch nạp tiền</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination - Responsive */}
                        {rechargeTransactions.length > 0 && pagination.TotalPages > 1 && (
                            <div className="flex justify-center items-center gap-1.5 md:gap-3 m-3 flex-wrap">
                                <button
                                    disabled={pagination.CurrentPage === 1}
                                    onClick={() => handlePageChange(pagination.CurrentPage - 1)}
                                    className="px-2.5 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    <span className="hidden sm:inline">« Trước</span>
                                    <span className="sm:hidden">«</span>
                                </button>

                                {getPageNumbers(
                                    pagination.TotalPages,
                                    pagination.CurrentPage,
                                    typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : 2
                                ).map((page, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                                        disabled={page === '...'}
                                        className={`px-2.5 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-lg border transition-all min-w-[32px] md:min-w-[40px] ${pagination.CurrentPage === page
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white hover:bg-gray-100'
                                            } ${page === '...' ? 'cursor-default opacity-70' : ''}`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    disabled={pagination.CurrentPage === pagination.TotalPages}
                                    onClick={() => handlePageChange(pagination.CurrentPage + 1)}
                                    className="px-2.5 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    <span className="hidden sm:inline">Sau »</span>
                                    <span className="sm:hidden">»</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Deposit Modal - Responsive */}
            {showDepositModal && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                    onClick={() => {
                        setShowDepositModal(false);
                        setDepositAmount(0);
                        setSelectedMethod(null);
                    }}
                >
                    <div
                        className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">
                            Nạp tiền vào ví
                        </h3>

                        <div className="mb-4 md:mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số tiền cần nạp
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={depositAmount ? depositAmount.toLocaleString("vi-VN") : ""}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/\D/g, "");
                                        setDepositAmount(rawValue ? Number(rawValue) : 0);
                                    }}
                                    placeholder="Nhập số tiền"
                                    className="w-full px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                                <span className="absolute right-4 top-2.5 md:top-3.5 text-gray-500 text-sm md:text-base">đ</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Tối thiểu 10.000đ</p>
                        </div>

                        <div className="mb-4 md:mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Phương thức thanh toán
                            </label>
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <button
                                    onClick={() => setSelectedMethod('Momo')}
                                    className={`p-3 md:p-4 border-2 rounded-xl transition-all ${selectedMethod === 'Momo'
                                        ? 'border-pink-400 bg-pink-50'
                                        : 'border-gray-200 hover:border-pink-300'
                                        }`}
                                >
                                    <img
                                        src={MomoPng.src}
                                        alt="MoMo"
                                        className="w-10 h-10 md:w-12 md:h-12 bg-pink-500 rounded-lg mx-auto mb-2"
                                    />
                                    <p className="text-xs md:text-sm font-medium text-gray-700">MoMo</p>
                                </button>

                                <button
                                    onClick={() => setSelectedMethod('VnPay')}
                                    className={`p-3 md:p-4 border-2 rounded-xl transition-all ${selectedMethod === 'VnPay'
                                        ? 'border-blue-400 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    <img
                                        src={VnpayPng.src}
                                        alt="VNPay"
                                        className="w-10 h-10 md:w-12 md:h-12 bg-blue-500 rounded-lg mx-auto mb-2"
                                    />
                                    <p className="text-xs md:text-sm font-medium text-gray-700">VNPay</p>
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row gap-3">
                            <button
                                onClick={() => {
                                    setShowDepositModal(false);
                                    setDepositAmount(0);
                                    setSelectedMethod(null);
                                }}
                                className="flex-1 px-4 md:px-6 py-2.5 md:py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all text-sm md:text-base"
                            >
                                Hủy
                            </button>

                            <button
                                onClick={handleDeposit}
                                disabled={!depositAmount || !selectedMethod}
                                className={`flex-1 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-medium transition-all text-sm md:text-base ${depositAmount && selectedMethod
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Tiếp tục
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Withdraw Modal - Responsive */}
            {showWithdrawModal && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                    onClick={() => {
                        setShowWithdrawModal(false);
                        resetWithdrawForm();
                    }}
                >
                    <div
                        className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">
                            Rút tiền từ ví
                        </h3>

                        {/* Số tiền cần rút */}
                        <div className="mb-4 md:mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số tiền cần rút
                            </label>

                            <div className="relative">
                                <input
                                    type="text"
                                    value={withdrawAmount ? withdrawAmount.toLocaleString("vi-VN") : ""}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/\D/g, "");
                                        setWithdrawAmount(rawValue ? Number(rawValue) : 0);
                                    }}
                                    placeholder="Nhập số tiền"
                                    className="w-full px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-xl 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                                <span className="absolute right-4 top-2.5 md:top-3.5 text-gray-500 text-sm md:text-base">đ</span>
                            </div>

                            <p className="text-xs font-medium text-yellow-600 mt-2 flex items-center gap-1">
                                ⚠️ Tối thiểu 10.000đ – Tối đa {formatPrice(wallet?.balance ?? 0)}đ
                            </p>
                        </div>

                        {/* Chọn ngân hàng */}
                        <div className="mb-4 md:mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Chọn ngân hàng
                            </label>

                            <div className="relative">
                                {/* Nút mở dropdown */}
                                <div
                                    onClick={() => setShowBankDropdown(!showBankDropdown)}
                                    className="w-full px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-xl 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white 
                       cursor-pointer flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        {selectedBank ? (
                                            <>
                                                <img
                                                    src={selectedBank.logoUrl}
                                                    alt=""
                                                    className="w-6 h-6 object-contain"
                                                />
                                                <span className="text-gray-900">
                                                    {selectedBank.shortName}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-gray-400">Chọn ngân hàng</span>
                                        )}
                                    </div>

                                    <svg
                                        className={`w-5 h-5 text-gray-400 transition-transform ${showBankDropdown ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                </div>

                                {/* Dropdown */}
                                {showBankDropdown && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-lg z-10">

                                        {/* Ô tìm kiếm */}
                                        <div className="p-2">
                                            <input
                                                type="text"
                                                placeholder="Tìm kiếm ngân hàng..."
                                                value={bankSearchQuery}
                                                onChange={(e) => setBankSearchQuery(e.target.value)}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg 
                                   focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                                autoFocus
                                            />
                                        </div>

                                        {/* Danh sách ngân hàng */}
                                        <div className="max-h-60 overflow-y-auto">
                                            {filteredBanks.length > 0 ? (
                                                filteredBanks.map((bank) => (
                                                    <div
                                                        key={bank.bankCode}
                                                        onClick={() => {
                                                            setSelectedBank(bank);
                                                            setShowBankDropdown(false);
                                                            setBankSearchQuery('');
                                                        }}
                                                        className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center gap-3
                                    ${selectedBank?.bankCode === bank.bankCode
                                                                ? 'bg-blue-100 text-blue-900'
                                                                : 'hover:bg-gray-100 text-gray-900'
                                                            }`}
                                                    >
                                                        <img src={bank.logoUrl} className="w-7 h-7 object-contain" />

                                                        <div>
                                                            <p className="font-medium text-gray-800">{bank.shortName}</p>
                                                            <p className="text-xs text-gray-500">{bank.name}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                                    Không tìm thấy ngân hàng
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Số tài khoản ngân hàng */}
                        <div className="mb-4 md:mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số tài khoản ngân hàng
                            </label>

                            <input
                                type="text"
                                value={bankAccountNumber}
                                onChange={(e) => {
                                    // Lấy chỉ số
                                    let onlyNumbers = e.target.value.replace(/\D/g, "");

                                    // Giới hạn tối đa 20 số
                                    if (onlyNumbers.length > 20) {
                                        onlyNumbers = onlyNumbers.substring(0, 20);
                                    }

                                    setBankAccountNumber(onlyNumbers);
                                }}
                                placeholder="Nhập số tài khoản"
                                className="w-full px-4 py-2.5 md:py-3 text-sm md:text-base border border-gray-300 rounded-xl 
                                           focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            />

                            <p className="text-xs font-medium text-yellow-600 mt-2 flex items-center gap-1">
                                ⚠️ Vui lòng kiểm tra kỹ số tài khoản trước khi rút tiền
                            </p>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row gap-3">
                            <button
                                onClick={() => {
                                    setShowWithdrawModal(false);
                                    resetWithdrawForm();
                                }}
                                className="flex-1 px-4 md:px-6 py-2.5 md:py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all text-sm md:text-base"
                            >
                                Hủy
                            </button>

                            <button
                                onClick={handleWithdraw}
                                disabled={!withdrawAmount || !selectedBank || !bankAccountNumber}
                                className={`flex-1 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-medium transition-all text-sm md:text-base ${withdrawAmount && selectedBank && bankAccountNumber
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-md'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                Tiếp tục
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showTransactionDetailModal && selectedTransaction && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
                    onClick={() => {
                        setShowTransactionDetailModal(false);
                        setSelectedTransaction(null);
                    }}
                >
                    <div
                        className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-6">
                            Chi tiết giao dịch
                        </h3>

                        {/* Transaction Details */}
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                <span className="text-sm text-gray-600">Loại giao dịch:</span>
                                <span className="text-sm font-medium text-gray-800">
                                    {typeTransaction(selectedTransaction.type)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                <span className="text-sm text-gray-600">Số tiền:</span>
                                <span className={`text-sm font-semibold ${selectedTransaction.type === 'Recharge' || selectedTransaction.type === 'Refund' ? 'text-green-600' : 'text-red-600'}`}>
                                    {selectedTransaction.type === 'Recharge' || selectedTransaction.type === 'Refund' ? '+' : '-'}
                                    {formatPrice(selectedTransaction.money)}đ
                                </span>
                            </div>

                            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                <span className="text-sm text-gray-600">Phương thức:</span>
                                <span className="text-sm font-medium text-gray-800">
                                    {selectedTransaction.method}
                                </span>
                            </div>

                            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                <span className="text-sm text-gray-600">Trạng thái:</span>
                                <div className="flex items-center gap-1">
                                    {getStatusIcon(selectedTransaction.status).icon}
                                    <span className="text-sm font-medium">
                                        {getStatusIcon(selectedTransaction.status).text}
                                    </span>
                                </div>
                            </div>
                            {selectedTransaction.bankName && (
                                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                    <span className="text-sm text-gray-600">Ngân hàng:</span>
                                    <span className="text-sm font-medium text-gray-800">
                                        {selectedTransaction.bankName}
                                    </span>
                                </div>
                            )}

                            {selectedTransaction.bankAccountNumber && (
                                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                    <span className="text-sm text-gray-600">Số tài khoản:</span>
                                    <span className="text-sm font-medium text-gray-800">
                                        {selectedTransaction.bankAccountNumber}
                                    </span>
                                </div>
                            )}


                            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                <span className="text-sm text-gray-600">Ngày tạo:</span>
                                <span className="text-sm font-medium text-gray-800">
                                    {formatDate(selectedTransaction.createAt)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Cập nhật lúc:</span>
                                <span className="text-sm font-medium text-gray-800">
                                    {formatDate(selectedTransaction.updatedAt)}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row gap-3">
                            <button
                                onClick={() => {
                                    setShowTransactionDetailModal(false);
                                    setSelectedTransaction(null);
                                }}
                                className="flex-1 px-4 md:px-6 py-2.5 md:py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all text-sm md:text-base"
                            >
                                Đóng
                            </button>

                            {/* Nút Hủy - chỉ hiển thị khi type = Withdraw và status = Pending */}
                            {selectedTransaction.type === 'Withdraw' && selectedTransaction.status === 'Pending' && (
                                <button
                                    onClick={handleCancelWithdraw}
                                    disabled={cancellingTransaction}
                                    className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-xl font-medium transition-all text-sm md:text-base"
                                >
                                    {cancellingTransaction ? 'Đang hủy...' : 'Hủy giao dịch'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}