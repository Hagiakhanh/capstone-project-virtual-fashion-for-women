"use client";

import React, { useState, useEffect, useCallback } from "react";
import { api } from "@/api/instance";
// Giả định bạn tạo file types/dashboard.d.ts
import { BasicSystemIndicator, TransactionAdmin} from "@/models/Dashboard"; 
import formatPrice from "@/utils/formatPrice"; // Cần tạo hàm này để format tiền tệ
import TransactionTable from "./TransactionTable"; // Component con cho bảng giao dịch
import { PaginationDTO } from "@/models/PaginationDTO";
import { DollarSign, BarChart2, Repeat, Package, Truck, CheckCircle, User, Users, XCircle } from 'lucide-react';


interface IndicatorCardProps {
    title: string;
    value: number | string;
    type?: string;
    icon?: React.ElementType; // Thêm icon
    iconColor?: string; // Thêm màu icon
}

const IndicatorCard: React.FC<IndicatorCardProps> = ({ title, value, type, icon: Icon, iconColor = 'text-indigo-600' }) => (
    <div className={`p-4 rounded-xl shadow-md flex items-center justify-between transition-shadow hover:shadow-lg ${type === 'netRevenue' ? 'bg-indigo-50 border border-indigo-200' : 'bg-white border border-gray-100'}`}>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className={`text-xl font-bold mt-1 ${type === 'netRevenue' ? 'text-indigo-600' : 'text-gray-900'}`}>{value}</p>
        </div>
        {Icon && (
            <div className={`p-2 rounded-full ${type === 'netRevenue' ? 'bg-indigo-200' : 'bg-gray-100'}`}>
                <Icon size={20} className={iconColor} />
            </div>
        )}
    </div>
);

const initialIndicator: BasicSystemIndicator = {
    totalProcessingOrders: 0,
    totalRefundOrders: 0,
    totalCompletedOrders: 0,
    totalRefundsCompleted: 0,
    totalCustomers: 0,
    totalStaffs: 0, // Giá trị mặc định
    totalGrossRevenue: 0,
    totalRefundAmount: 0,
    totalNetRevenue: 0,
};

// --- COMPONENT CHÍNH: OverviewTab ---
export default function OverviewTab() {
    const [indicators, setIndicators] = useState<BasicSystemIndicator>(initialIndicator);
    const [transactions, setTransactions] = useState<TransactionAdmin[]>([]);

    // Sử dụng PaginationDTO
    const [pagination, setPagination] = useState<PaginationDTO>({
        CurrentPage: 1,
        HasNext: false,
        HasPrevious: false,
        PageSize: 6,
        TotalCount: 0,
        TotalPages: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [filterParams, setFilterParams] = useState({
        orderId: '',
        type: '',
        status: '',
        method: '',
        startDate: '',
        endDate: '',
    });

    const fetchIndicators = useCallback(async () => {
        try {
            const response = await api.get('/dashboard/overview');
            setIndicators(response.data);
        } catch (err: any) {
            console.error("Fetch indicators error:", err);
            setError(err.message || "Không thể tải dữ liệu tổng quan.");
        }
    }, []); 

    const { PageSize, CurrentPage } = pagination;

    //const fetchTransactions = useCallback(async (filters: typeof filterParams) => {
    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const payloadPagination: any = {
                pageSize: PageSize, 
                pageNumber: CurrentPage,
                //orderId: filters.orderId > 0 ? filters.orderId : undefined, 
                // type: filters.type,
                // status: filters.status,
                // method: filters.method,
                // startDate: filters.startDate,
                // endDate: filters.endDate,
                type: filterParams.type || undefined,
                status: filterParams.status || undefined,
                method: filterParams.method || undefined,
                startDate: filterParams.startDate || undefined,
                endDate: filterParams.endDate || undefined,
            };

            // if (filterParams.orderId > 0) {
            //     payloadPagination.orderId = filterParams.orderId;
            // }

            if (Number(filterParams.orderId) > 0) {
                payloadPagination.orderId = Number(filterParams.orderId);
            }

            const response = await api.get(`/transaction`, { params: payloadPagination });

            const jsonResponse = response.data;

            const fetchedTransactions: TransactionAdmin[] = jsonResponse.data || [];

            setTransactions(fetchedTransactions);

            if (jsonResponse.pagination) {
                setPagination((prev) => ({
                    ...prev,
                    ...jsonResponse.pagination
                }));
            }

        } catch (err: any) {
            console.error("Fetch transactions error:", err);
            setError(err.message || "Không thể tải lịch sử giao dịch.");
        } finally {
            setLoading(false);
        }
    //}, [PageSize, CurrentPage, filterParams, setPagination]); 
    }, [pagination.PageSize, pagination.CurrentPage, filterParams]);

    useEffect(() => {
        fetchIndicators(); 
    }, [fetchIndicators]);

    useEffect(() => {
    //     fetchTransactions(filterParams);
    // }, [CurrentPage, filterParams, fetchTransactions]); 
        fetchTransactions();
    }, [fetchTransactions]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.TotalPages) {
            setPagination((prev) => ({ ...prev, CurrentPage: newPage }));
        }
    };

    const handleApplyFilter = (newFilters: typeof filterParams) => {
        setFilterParams(newFilters);
        setPagination((prev) => ({ ...prev, CurrentPage: 1 }));
    };

    if (error) {
        return <div className="text-red-600 p-4 border border-red-200 rounded">Lỗi: {error}</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-sans text-gray-800">Tổng quan hệ thống của bạn</h2>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-5 font-sans">
                <IndicatorCard title="Tổng Doanh thu Thuần" value={formatPrice(indicators.totalNetRevenue ?? 0)+ " đ"} type="netRevenue" icon={DollarSign} iconColor="text-indigo-600"/>
                <IndicatorCard title="Tổng Doanh thu Gộp" value={formatPrice(indicators.totalGrossRevenue ?? 0) + " đ"} icon={BarChart2} iconColor="text-purple-600"/>
                <IndicatorCard title="Tổng Hoàn tiền" value={formatPrice(indicators.totalRefundAmount ?? 0) + " đ"} icon={XCircle} iconColor="text-pink-600"/>
                <IndicatorCard title="Đơn hàng đang xử lý" value={indicators.totalProcessingOrders} icon={Package} iconColor="text-orange-600"/>
                <IndicatorCard title="Đơn hàng đang hoàn tiền" value={indicators.totalRefundOrders} icon={Truck} iconColor="text-amber-600"/>
                <IndicatorCard title="Tổng đơn đã hoàn thành" value={indicators.totalCompletedOrders} icon={CheckCircle} iconColor="text-green-600"/>
                <IndicatorCard title="Tổng đơn đã hoàn tiền xong" value={indicators.totalRefundsCompleted} icon={Repeat} iconColor="text-teal-600"/>
                <IndicatorCard title="Tổng Khách hàng" value={indicators.totalCustomers} icon={User} iconColor="text-violet-600"/>
                <IndicatorCard title="Tổng Nhân viên" value={indicators.totalStaffs} icon={Users} iconColor="text-purple-500"/>
            </div>

            {/* 2. Bảng Transaction */}
            <TransactionTable
                transactions={transactions}
                loading={loading}
                pagination={pagination}
                filterParams={filterParams}
                onApplyFilter={handleApplyFilter}
                onPageChange={handlePageChange}
            />
        </div>
    );
}