'use client';

import React from 'react';
import { TransactionInformation } from '@/models/TransactionInformation';
import { Calendar, CheckCircle2, Clock, Receipt, Wallet, XCircle } from 'lucide-react';
import formatPrice from '@/utils/formatPrice';
import formatDate from '@/utils/formatDate';
import MomoPng from '../../assets/payment/momo.png';
import VnpayPng from '../../assets/payment/vnpay.png';
import LoadingSpinner from '../Loading/LoadingSpinner';

interface Props {
    transactions: TransactionInformation[];
    loading: boolean;
}

export default function TransactionTable({ transactions, loading }: Props) {
    type TransactionStatus = 'Success' | 'Failed' | 'Pending';
    const styles: Record<TransactionStatus, {
        icon: React.ElementType;
        color: string;
        bg: string;
        text: string;
    }> = {
        Success: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', text: 'Thành công' },
        Failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', text: 'Thất bại' },
        Pending: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', text: 'Đang xử lý' }
    };

    const getStatusIcon = (status: string) => {
        const key = (['Success', 'Failed', 'Pending'].includes(status) ? status : 'Pending') as TransactionStatus;
        return styles[key];
    };

    const PaymentMethodIcon = ({ method }: { method: string }) => {
        if (method === 'Momo') {
            return <img src={MomoPng.src} alt="Momo" className="w-6 h-6 md:w-7 md:h-7" />;
        }
        if (method === 'VnPay') {
            return <img src={VnpayPng.src} alt="VnPay" className="w-6 h-6 md:w-7 md:h-7" />;
        }
        if (method === 'Wallet') {
            return (
                <div className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center bg-indigo-100 rounded-full">
                    <Wallet className="w-3 h-3 md:w-4 md:h-4 text-indigo-600" />
                </div>
            );
        }
        return null;
    };

    return (
        <div className="max-w-6xl w-full mx-auto mb-6">
            {/* Loading state */}
            {loading ? (
                <div className="py-12 md:py-20">
                    <LoadingSpinner size={50} />
                </div>
            ) : transactions.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center">
                    <Receipt className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
                    <p className="text-gray-500 text-base md:text-lg">Không có giao dịch nào</p>
                </div>
            ) : (
                <>
                    {/* Mobile: Card view */}
                    <div className="block md:hidden space-y-3">
                        {transactions.map((transaction) => {
                            const statusInfo = getStatusIcon(transaction.status);
                            const StatusIcon = statusInfo.icon;

                            return (
                                <div
                                    key={transaction.transactionCode}
                                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                                >
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 mb-1">
                                                {transaction.transactionCode}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                ORD-{transaction.orderId}
                                            </p>
                                        </div>
                                        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full ${statusInfo.bg} flex-shrink-0 ml-2`}>
                                            <StatusIcon className={`w-3.5 h-3.5 ${statusInfo.color}`} />
                                            <span className={`text-xs font-medium ${statusInfo.color}`}>
                                                {statusInfo.text}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-2.5">
                                        {/* Amount */}
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Số tiền:</span>
                                            <span className="text-base font-bold text-orange-600">
                                                {formatPrice(transaction.money)} ₫
                                            </span>
                                        </div>

                                        {/* Payment method */}
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Phương thức:</span>
                                            <div className="flex items-center gap-2">
                                                <PaymentMethodIcon method={transaction.method} />
                                                <span className="text-sm font-medium text-gray-800">
                                                    {transaction.method !== "Wallet" ? transaction.method : 'Ví'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {formatDate(transaction.updatedAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop: Table view */}
                    <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                                            Transaction code
                                        </th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                                            Order ID
                                        </th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                                            Số tiền
                                        </th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                                            Phương thức
                                        </th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                                            Trạng thái
                                        </th>
                                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                                            Ngày tạo
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {transactions.map((transaction) => {
                                        const statusInfo = getStatusIcon(transaction.status);
                                        const StatusIcon = statusInfo.icon;
                                        return (
                                            <tr
                                                key={transaction.transactionCode}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {transaction.transactionCode}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    ORD-{transaction.orderId}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    {formatPrice(transaction.money)} ₫
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <PaymentMethodIcon method={transaction.method} />
                                                        <span className="text-sm text-gray-900">
                                                            {transaction.method !== "Wallet" ? transaction.method : 'Ví'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${statusInfo.bg}`}
                                                    >
                                                        <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                                                        <span className={`text-sm font-medium ${statusInfo.color}`}>
                                                            {statusInfo.text}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        {formatDate(transaction.updatedAt)}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}