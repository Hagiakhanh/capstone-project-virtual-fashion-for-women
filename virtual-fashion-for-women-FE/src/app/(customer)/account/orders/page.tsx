'use client';

import React, { useEffect, useState } from 'react';
import { OrderDTO } from '@/models/OrderDTO';
import OrderItem from '@/components/Order/OrderItem';
import { CheckCircle, Clock, Package, Truck, Home, XCircle, ClipboardCheck } from 'lucide-react';
import { messageToast } from '@/helpers/toastHelper';
import { api } from '@/api/instance';
import { PaginationDTO } from '@/models/PaginationDTO';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';

const statusTabs = [
    { key: '', label: 'Tất cả', icon: null },
    { key: 'Pending', label: 'Chờ thanh toán', icon: Clock },
    { key: 'Confirmed', label: 'Đã xác nhận', icon: ClipboardCheck },
    { key: 'Packed', label: 'Đã đóng gói', icon: Package },
    { key: 'Delivering', label: 'Đang giao', icon: Truck },
    { key: 'Delivered', label: 'Đã giao', icon: Home },
    { key: 'Completed', label: 'Hoàn tất', icon: CheckCircle },
    { key: 'Failed', label: 'Thất bại', icon: XCircle },
];

export default function OrderManagement() {
    const [statusFilter, setStatusFilter] = useState('');
    const [orders, setOrders] = useState<OrderDTO[]>([]);
    const [pagination, setPagination] = useState<PaginationDTO>({
        CurrentPage: 1,
        HasNext: false,
        HasPrevious: false,
        PageSize: 6,
        TotalCount: 0,
        TotalPages: 0,
    });
    const [loading, setLoading] = useState(false);


    const fetchOrders = async () => {
        try {
            setLoading(true);
            const payloadPagination = {
                pageSize: pagination.PageSize,
                pageNumber: pagination.CurrentPage,
                statusFilter: statusFilter
            }
            const response = await api.get("/my-order", { params: payloadPagination });
            if (response.status === 200) {
                setOrders(response.data.data);
                setPagination((prev) => ({
                    ...prev,
                    ...response.data.pagination
                }));
            }
        } catch (error: any) {
            messageToast.error(error);
        } finally {
            setLoading(false);
        }
    }


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


    useEffect(() => {
        fetchOrders();
    }, [pagination.CurrentPage, pagination.PageSize, statusFilter]);

    return (
        <div className="bg-gradient-to-br">
            <div className="max-w-7xl mx-auto flex-1 flex flex-col">
                {/* Header */}
                <h1 className="text-3xl font-semibold text-gray-800 mb-6">Đơn hàng của bạn</h1>

                {/* Filter tabs */}
                <div className="flex flex-wrap gap-3 mb-6">
                    {statusTabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = statusFilter === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => {
                                    setStatusFilter(tab.key);
                                    setPagination((prev) => ({ ...prev, CurrentPage: 1 }));
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${active
                                    ? 'bg-black text-white border-black shadow'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                                    }`}
                            >
                                {Icon && <Icon size={18} />}
                                <span className="text-sm font-medium">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Orders List - Fixed height container */}
                <div className="flex-1 mb-6">
                    <div className="space-y-4">
                        {loading ? (
                            <div className="py-20">
                                <LoadingSpinner size={50} />
                            </div>
                        ) : (
                            orders.length === 0 ? (
                                <div className="text-center p-12 bg-white rounded-2xl shadow text-gray-500">
                                    Không có đơn hàng
                                </div>
                            ) : (
                                orders.map((order) => <OrderItem key={order.orderId} order={order} />)
                            )
                        )}
                    </div>
                </div>

                <div className="flex justify-center items-center gap-3">
                    {/* Nút trước */}
                    <button
                        disabled={pagination.CurrentPage === 1}
                        onClick={() => handlePageChange(pagination.CurrentPage - 1)}
                        className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        « Trước
                    </button>

                    {getPageNumbers(pagination.TotalPages, pagination.CurrentPage).map((page, idx) => (
                        <button
                            key={idx}
                            onClick={() => typeof page === 'number' && handlePageChange(page)}
                            disabled={page === "..."}
                            className={`px-4 py-2 rounded-lg border transition-all ${pagination.CurrentPage === page
                                ? 'bg-black text-white border-black'
                                : 'bg-white hover:bg-gray-100'
                                } ${page === "..." ? 'cursor-default opacity-70' : ''}`}
                        >
                            {page}
                        </button>
                    ))}

                    {/* Nút sau */}
                    <button
                        disabled={pagination.CurrentPage === pagination.TotalPages}
                        onClick={() => handlePageChange(pagination.CurrentPage + 1)}
                        className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        Sau »
                    </button>
                </div>

            </div>
        </div>
    );
}