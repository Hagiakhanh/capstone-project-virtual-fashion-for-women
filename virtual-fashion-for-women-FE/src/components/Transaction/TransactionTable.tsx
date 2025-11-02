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

    const skeletonRows = Array.from({ length: 5 });

    const getStatusIcon = (status: string) => {
        const key = (['Success', 'Failed', 'Pending'].includes(status) ? status : 'Pending') as TransactionStatus;
        return styles[key];
    };

    return (
        <div className="max-w-6xl mx-auto mb-6">
            {/* Khi đang loading */}
            {loading ? (
                <div className="py-20">
                    <LoadingSpinner size={50} />
                </div>
            ) : transactions.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Không có giao dịch nào</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-left base font-semibold text-gray-700">Transaction code</th>
                                    <th className="px-6 py-4 text-left base font-semibold text-gray-700">Order ID</th>
                                    <th className="px-6 py-4 text-left base font-semibold text-gray-700">Số tiền</th>
                                    <th className="px-6 py-4 text-left base font-semibold text-gray-700">Phương thức</th>
                                    <th className="px-6 py-4 text-left base font-semibold text-gray-700">Trạng thái</th>
                                    <th className="px-6 py-4 text-left base font-semibold text-gray-700">Ngày tạo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {transactions.map((transaction) => {
                                    const statusInfo = getStatusIcon(transaction.status);
                                    const StatusIcon = statusInfo.icon;
                                    return (
                                        <tr key={transaction.transactionCode} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 base text-gray-900">{transaction.transactionCode}</td>
                                            <td className="px-6 py-4 base text-gray-900">ORD-{transaction.orderId}</td>
                                            <td className="px-6 py-4 base font-medium text-gray-900">
                                                {formatPrice(transaction.money)} ₫
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {transaction.method === 'Momo' && (
                                                        <img src={MomoPng.src} alt="Momo" className="w-7 h-7 mr-2" />
                                                    )}
                                                    {transaction.method === 'Vnpay' && (
                                                        <img src={VnpayPng.src} alt="Vnpay" className="w-7 h-7 mr-2" />
                                                    )}
                                                    {transaction.method === 'Wallet' && (
                                                        <div className="w-7 h-7 flex items-center justify-center bg-indigo-100 rounded-full mr-2">
                                                            <Wallet className="w-4 h-4 text-indigo-600" />
                                                        </div>
                                                    )}
                                                    <span className="base text-gray-900">{transaction.method}</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${statusInfo.bg}`}>
                                                    <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                                                    <span className={`base font-medium ${statusInfo.color}`}>
                                                        {statusInfo.text}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 base text-gray-600">
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
            )}
        </div>
    );
}
