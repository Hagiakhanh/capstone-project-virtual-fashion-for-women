'use client';

import React, { useEffect, useState } from 'react';
import { OrderDTO } from '@/models/OrderDTO';
import OrderItem from '@/components/Order/OrderItem';
import { CheckCircle, Clock, Package, Truck, Home, XCircle, ClipboardCheck, Undo2, RotateCcw } from 'lucide-react';
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
    { key: 'Returning', label: 'Đang trả hàng', icon: Undo2 },
    { key: 'Returned', label: 'Đã trả hàng', icon: RotateCcw },
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
        <div className="bg-gradient-to-br w-full">
            <div className="max-w-7xl mx-auto flex-1 flex flex-col">
                {/* Header - Responsive */}
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4 md:mb-6">
                    Đơn hàng của bạn
                </h1>

                {/* Filter tabs - Horizontal scroll on mobile */}
                <div className="mb-4 -mx-4 px-4 md:mx-0 md:px-0 overflow-hidden">
                    <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
                                    className={`inline-flex items-center gap-1.5 px-3 py-2 md:px-2.5 md:py-1.5 rounded-full border transition-all flex-shrink-0 ${active
                                        ? 'bg-black text-white border-black shadow'
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100 active:scale-95'
                                        }`}
                                >
                                    {Icon && <Icon size={16} className="shrink-0" />}
                                    <span className="text-xs md:text-sm font-medium whitespace-nowrap">
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Orders List - Responsive */}
                <div className="flex-1 mb-6">
                    <div className="space-y-3 md:space-y-4">
                        {loading ? (
                            <div className="py-12 md:py-20">
                                <LoadingSpinner size={50} />
                            </div>
                        ) : (
                            orders.length === 0 ? (
                                <div className="text-center p-8 md:p-12 bg-white rounded-xl md:rounded-2xl shadow text-gray-500 text-sm md:text-base">
                                    Không có đơn hàng
                                </div>
                            ) : (
                                orders.map((order) => <OrderItem key={order.orderId} order={order} />)
                            )
                        )}
                    </div>
                </div>

                {/* Pagination - Responsive */}
                {pagination.TotalPages > 1 && (
                    <div className="flex justify-center items-center gap-1.5 md:gap-3 flex-wrap px-2">
                        {/* Nút trước */}
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
                                disabled={page === "..."}
                                className={`px-2.5 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-lg border transition-all min-w-[32px] md:min-w-[40px] ${pagination.CurrentPage === page
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
                            className="px-2.5 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <span className="hidden sm:inline">Sau »</span>
                            <span className="sm:hidden">»</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}