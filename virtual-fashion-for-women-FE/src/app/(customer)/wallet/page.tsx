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

export default function WalletPage() {
    const router = useRouter();
    const [wallet, setWallet] = useState<WalletDTO>();
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState<number>(0);
    const [selectedMethod, setSelectedMethod] = useState<'Momo' | 'VnPay' | null>(
        null
    );
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

    const getStatusIcon = (status: string) => {
        const key = (['Success', 'Failed', 'Pending'].includes(status)
            ? status
            : 'Pending') as TransactionStatus;

        const { icon: Icon, color, text } = styles[key];

        return {
            icon: <Icon className={`w-8 h-8 ${color}`} />,
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
            default:
                return 'Khác';
        }
    }

    useEffect(() => {
        fetchRechargeTransactions();
    }, [pagination.CurrentPage, pagination.PageSize]);

    return (
        <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 py-10 px-6">
            {/* Thay đổi tại đây */}
            <div className="mx-auto grid grid-cols-1 md:grid-cols-[3fr_7fr] gap-8">

                {loading && <LoadingOverlay />}
                {/* Left: Wallet Info */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-xl flex items-center justify-center shadow-md">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-800">Ví của tôi</h1>
                            <p className="text-sm text-gray-500">Quản lý tài chính cá nhân</p>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500/90 to-indigo-500/90 rounded-2xl p-8 text-white shadow-lg">
                        <p className="text-blue-100 text-sm mb-2">Số dư khả dụng</p>
                        <h2 className="text-4xl font-bold mb-6">{formatPrice(wallet?.balance ?? 0)}đ</h2>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDepositModal(true)}
                                className="flex-1 bg-white text-blue-600 py-3 rounded-xl font-medium hover:bg-blue-50 transition-all shadow-sm"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Plus className="w-4 h-4" /> Nạp tiền
                                </div>
                            </button>
                            {/* <button
                                className="flex-1 bg-white/20 backdrop-blur-md text-white py-3 rounded-xl font-medium hover:bg-white/30 transition-all"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <ArrowUpRight className="w-4 h-4" /> Rút tiền
                                </div>
                            </button> */}
                        </div>
                    </div>
                </div>

                {/* Right: Transaction History */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800">Lịch sử giao dịch</h3>
                    </div>

                    <div className="flex flex-col justify-between">
                        <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
                            {rechargeTransactions.length > 0 ? (
                                rechargeTransactions.map((t) => {
                                    const statusInfor = getStatusIcon(t.status);
                                    return (
                                        <div
                                            key={t.transactionId}
                                            className="p-5 hover:bg-gray-50 transition-colors flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${t.type === 'Recharge' || t.type === 'Refund' ? 'bg-green-50' : 'bg-red-50'
                                                        }`}
                                                >
                                                    {t.type === 'Recharge' || t.type === 'Refund' ? (
                                                        <ArrowDownLeft className="w-5 h-5 text-green-600" />
                                                    ) : (
                                                        <ArrowUpRight className="w-5 h-5 text-red-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-800">
                                                        {typeTransaction(t.type)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {t.method} • {formatDate(t.updatedAt)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p
                                                    className={`text-base font-semibold ${t.type === 'Recharge' || t.type === 'Refund' ? 'text-green-600' : 'text-red-600'
                                                        }`}
                                                >
                                                    {t.type === 'Recharge' || t.type === 'Refund' ? '+' : '-'}
                                                    {formatPrice(t.money)}
                                                </p>
                                                <div className="flex items-center gap-1 justify-end mt-1">
                                                    {statusInfor.icon}
                                                    <span className="text-base text-gray-600">
                                                        {statusInfor.text}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col justify-center items-center h-full text-gray-500 py-20">
                                    <Clock className="w-8 h-8 mb-2 text-gray-400" />
                                    <p className="text-base font-medium">Không có giao dịch nạp tiền</p>
                                </div>
                            )}
                        </div>

                        {rechargeTransactions.length > 0 && (
                            <div className="flex justify-center items-center gap-3 m-3">
                                {/* Nút trước */}
                                <button
                                    disabled={pagination.CurrentPage === 1}
                                    onClick={() => handlePageChange(pagination.CurrentPage - 1)}
                                    className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    « Trước
                                </button>

                                {getPageNumbers(pagination.TotalPages, pagination.CurrentPage).map(
                                    (page, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => typeof page === 'number' && handlePageChange(page)}
                                            disabled={page === '...'}
                                            className={`px-4 py-2 rounded-lg border transition-all ${pagination.CurrentPage === page
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white hover:bg-gray-100'
                                                } ${page === '...' ? 'cursor-default opacity-70' : ''}`}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}

                                {/* Nút sau */}
                                <button
                                    disabled={pagination.CurrentPage === pagination.TotalPages}
                                    onClick={() => handlePageChange(pagination.CurrentPage + 1)}
                                    className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                >
                                    Sau »
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {showDepositModal && (
                <div
                    className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                    onClick={() => {
                        setShowDepositModal(false);
                        setDepositAmount(0);
                        setSelectedMethod(null);
                    }}
                >
                    {/* Chặn click bên trong modal lan ra ngoài */}
                    <div
                        className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-semibold text-gray-800 mb-6">
                            Nạp tiền vào ví
                        </h3>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số tiền cần nạp
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={depositAmount ? depositAmount.toLocaleString("vi-VN") : ""}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/\D/g, ""); // bỏ ký tự không phải số
                                        setDepositAmount(rawValue ? Number(rawValue) : 0);
                                    }}
                                    placeholder="Nhập số tiền"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                                <span className="absolute right-4 top-3.5 text-gray-500">đ</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Tối thiểu 10.000đ</p>
                        </div>


                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Phương thức thanh toán
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setSelectedMethod('Momo')}
                                    className={`p-4 border-2 rounded-xl transition-all ${selectedMethod === 'Momo'
                                        ? 'border-pink-400 bg-pink-50'
                                        : 'border-gray-200 hover:border-pink-300'
                                        }`}
                                >
                                    <img
                                        src={MomoPng.src}
                                        alt="MoMo"
                                        className="w-12 h-12 bg-pink-500 rounded-lg mx-auto mb-2 flex items-center justify-center"
                                    />
                                    <p className="text-sm font-medium text-gray-700">MoMo</p>
                                </button>

                                <button
                                    onClick={() => setSelectedMethod('VnPay')}
                                    className={`p-4 border-2 rounded-xl transition-all ${selectedMethod === 'VnPay'
                                        ? 'border-blue-400 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    <img
                                        src={VnpayPng.src}
                                        alt="VNPay"
                                        className="w-12 h-12 bg-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center"
                                    />
                                    <p className="text-sm font-medium text-gray-700">VNPay</p>
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDepositModal(false);
                                    setDepositAmount(0);
                                    setSelectedMethod(null);
                                }}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                            >
                                Hủy
                            </button>

                            <button
                                onClick={handleDeposit}
                                disabled={!depositAmount || !selectedMethod}
                                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${depositAmount && selectedMethod
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

        </div>

    );
}
