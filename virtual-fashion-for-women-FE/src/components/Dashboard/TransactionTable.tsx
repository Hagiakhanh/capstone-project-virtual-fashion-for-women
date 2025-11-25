"use client";

import React, { useState, useMemo } from "react";
import formatPrice from "@/utils/formatPrice"; 
import { TransactionAdmin } from "@/models/Dashboard"; 
// Import PaginationDTO để đồng nhất kiểu dữ liệu với WishlistPage
import { PaginationDTO } from "@/models/PaginationDTO"; 

// --- KHAI BÁO TYPE CHO PROPS (CẬP NHẬT) ---

interface TransactionTableProps {
    transactions: TransactionAdmin[];
    loading: boolean;
    // Sử dụng kiểu PaginationDTO được truyền từ OverviewTab
    pagination: PaginationDTO | null; 
    filterParams: {
        type: string;
        status: string;
        method: string;
        startDate: string;
        endDate: string;
    };
    onApplyFilter: (filters: TransactionTableProps['filterParams']) => void;
    onPageChange: (newPage: number) => void;
}

// Các tùy chọn cứng cho bộ lọc
const filterOptions = {
    types: [{ value: '', label: 'Tất cả loại' }, { value: 'Purchase', label: 'Mua hàng' }, { value: 'Refund', label: 'Hoàn tiền' }, { value: 'Recharge', label: 'Nạp ví' }],
    statuses: [{ value: '', label: 'Tất cả trạng thái' }, { value: 'Success', label: 'Thành công' }, { value: 'Pending', label: 'Đang chờ' }, { value: 'Failed', label: 'Thất bại' }],
    methods: [{ value: '', label: 'Tất cả phương thức' }, { value: 'Momo', label: 'Momo' }, { value: 'VnPay', label: 'VnPay' }, { value: 'Wallet', label: 'Ví' }],
};

export default function TransactionTable({
    transactions,
    loading,
    pagination, // Đã là PaginationDTO | null
    filterParams,
    onApplyFilter,
    onPageChange,
}: TransactionTableProps) {
    const [dateError, setDateError] = useState("");
    
    // Khởi tạo trạng thái filter nội bộ
    const [currentFilters, setCurrentFilters] = useState(filterParams);

    // Xử lý thay đổi input
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        // setCurrentFilters(prev => ({
        //     ...prev,
        //     [name]: value,
        // }));
        const newFilters = {
            ...currentFilters,
            [name]: value,
        };

        const now = new Date(
            new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })
        );

        if (name === "startDate" || name === "endDate") {
            const selected = new Date(value);

            if (selected > now) {
                setDateError("Ngày không được chọn trong tương lai");
                return;
            }
        }

        // Validate
        if (newFilters.startDate && newFilters.endDate) {
            const start = new Date(newFilters.startDate);
            const end = new Date(newFilters.endDate);

            if (start > end) {
                setDateError("Ngày bắt đầu phải trước ngày kết thúc");
            } else {
                setDateError("");
            }
        }

        setCurrentFilters(newFilters);
    };

    // Xử lý áp dụng filter
    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onApplyFilter(currentFilters);
    };

    // --- LOGIC GỘP CÁC HÀM/COMPONENT CON (Nội bộ) ---
    
    // 1. Logic cho Badge trạng thái
    const StatusBadge = ({ status }: { status: string }) => {
        let color = 'bg-gray-100 text-gray-800';
        if (status === 'Success') color = 'bg-green-100 text-green-800';
        if (status === 'Failed') color = 'bg-red-100 text-red-800';
        if (status === 'Pending') color = 'bg-yellow-100 text-yellow-800';

        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${color}`}>
                {status}
            </span>
        );
    };

    // 2. Component Select cho Filter
    const FilterSelect = ({ 
        name, 
        label, 
        value, 
        onChange, 
        options, 
    }: { 
        name: string; 
        label: string; 
        value: string; 
        onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; 
        options: { value: string; label: string }[]; 
    }) => (
        <div>
            {/* Đã xóa label vì label đã có trong component cha */}
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                // Đã điều chỉnh class để loại bỏ mt-1 và sử dụng h-10 để khớp với nút Áp dụng
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-2 border bg-white cursor-pointer"
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );

    // 3. Component Input cho Filter
    const FilterInput = ({ name, label, type, value, onChange }: { name: string; label: string; type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
        <div>
            {/* Đã xóa label vì label đã có trong component cha */}
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                // Đã điều chỉnh class để loại bỏ mt-1 và sử dụng h-10 để khớp với nút Áp dụng
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 px-2 border cursor-pointer"
            />
        </div>
    );

    // 4. Hàm tạo dãy số trang có dấu '...' (Lấy từ WishlistPage, điều chỉnh tên biến)
    const getPageNumbers = (totalPages: number, currentPage: number, delta = 2): (number | string)[] => {
        const range: (number | string)[] = [];
        const left = Math.max(2, currentPage - delta);
        const right = Math.min(totalPages - 1, currentPage + delta);
        
        if (totalPages === 0) return [];
        if (totalPages === 1) return [1];

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
        
        if (totalPages > 1 && (range.length === 0 || range[range.length - 1] !== totalPages)) {
            range.push(totalPages);
        }
        
        return range;
    };
    
    // Tính toán dãy số trang cần hiển thị
    const pageNumbers = useMemo(() => {
        if (!pagination) return [];
        return getPageNumbers(pagination.TotalPages, pagination.CurrentPage);
    }, [pagination]);

    return (
        <div className="bg-white p-2 rounded-lg shadow-md">
            <h2 className="text-xl font-sans pb-2 pt-2">💰 Lịch sử Giao dịch</h2>
            {/* Bộ Lọc (Filter) */}
            {/* Đã đổi grid-cols-6 thành md:grid-cols-6, thêm các label và items-end */}
            <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-6 items-end">
                
                <div>
                    <label htmlFor="type" className="block text-sm font-sans text-black">Loại</label>
                    <FilterSelect 
                        name="type" 
                        label="Loại" 
                        value={currentFilters.type} 
                        onChange={handleChange} 
                        options={filterOptions.types} 
                    />
                </div>
                
                <div>
                    <label htmlFor="status" className="block text-sm font-sans text-black">Trạng thái</label>
                    <FilterSelect 
                        name="status" 
                        label="Trạng thái" 
                        value={currentFilters.status} 
                        onChange={handleChange} 
                        options={filterOptions.statuses} 
                    />
                </div>

                <div>
                    <label htmlFor="method" className="block text-sm font-sans text-black">Phương thức</label>
                    <FilterSelect 
                        name="method" 
                        label="Phương thức" 
                        value={currentFilters.method} 
                        onChange={handleChange} 
                        options={filterOptions.methods} 
                    />
                </div>
                
                <div>
                    <label htmlFor="startDate" className="block text-sm font-sans text-black">Từ ngày</label>
                    <FilterInput 
                        name="startDate" 
                        label="Từ ngày" 
                        type="date" 
                        value={currentFilters.startDate} 
                        onChange={handleChange} 
                    />
                </div>

                <div>
                    <label htmlFor="endDate" className="block text-sm font-sans text-black">Đến ngày</label>
                    <FilterInput 
                        name="endDate" 
                        label="Đến ngày" 
                        type="date" 
                        value={currentFilters.endDate} 
                        onChange={handleChange} 
                    />
                </div>
                
                {/* Nút Áp dụng */}
                <button
                    type="submit"
                    className="h-10 px-4 py-2 bg-indigo-600 text-white font-sans rounded-md hover:bg-indigo-700 transition duration-150 cursor-pointer"
                >
                    Áp Dụng
                </button>
                {dateError && <p className="text-red-500 text-sm">{dateError}</p>}
            </form>

            {/* Bảng Hiển thị Dữ liệu */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs text-black uppercase tracking-wider font-sans">ID</th>
                            <th className="px-4 py-3 text-left text-xs text-black uppercase tracking-wider font-sans">Khách hàng</th>
                            <th className="px-4 py-3 text-left text-xs text-black uppercase tracking-wider font-sans">Số tiền</th>
                            <th className="px-4 py-3 text-left text-xs text-black uppercase tracking-wider font-sans">Loại</th>
                            <th className="px-4 py-3 text-left text-xs text-black uppercase tracking-wider font-sans">Phương thức</th>
                            <th className="px-4 py-3 text-left text-xs text-black uppercase tracking-wider font-sans">Trạng thái</th>
                            <th className="px-4 py-3 text-left text-xs text-black uppercase tracking-wider font-sans">Thời gian</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={7} className="py-4 text-center text-gray-500">Đang tải dữ liệu...</td></tr>
                        ) : transactions.length === 0 ? (
                            <tr><td colSpan={7} className="py-4 text-center text-gray-500">Không tìm thấy giao dịch nào.</td></tr>
                        ) : (
                            transactions.map((t) => (
                                <tr key={t.transactionId}>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-sans text-gray-800">{t.transactionId}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-sans text-gray-800">{t.userName}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-sans text-green-700">{formatPrice(t.money)}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-sans text-gray-800">{t.type}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-sans text-gray-800">{t.method}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-sans text-gray-800"><StatusBadge status={t.status} /></td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-sans text-gray-800">{new Date(t.createdAt).toLocaleString('vi-VN')}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && (
                <div className="flex justify-between items-center mt-2">
                    {/* Thông tin phân trang - bên trái */}
                    <p className="text-sm text-gray-700">
                        Hiển thị <span className="font-sans">{(pagination.CurrentPage - 1) * pagination.PageSize + 1}</span> đến <span className="font-sans">{Math.min(pagination.CurrentPage * pagination.PageSize, pagination.TotalCount)}</span> trong tổng số <span className="font-sans">{pagination.TotalCount}</span> kết quả
                    </p>

                    {/* Phân Trang - bên phải */}
                    {pagination.TotalPages > 1 && (
                        <div className="flex items-center gap-1">
                            {/* Nút trước */}
                            <button
                                disabled={pagination.CurrentPage === 1}
                                onClick={() => onPageChange(pagination.CurrentPage - 1)}
                                className="px-2 py-1 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                « Trước
                            </button>

                            {/* Các nút số trang */}
                            {pageNumbers.map((page, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => typeof page === 'number' && onPageChange(page)}
                                    disabled={page === "..."}
                                    className={`px-3 py-1 rounded-lg border transition-all cursor-pointer ${pagination.CurrentPage === page
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white hover:bg-gray-100'
                                    } ${page === "..." ? 'cursor-default opacity-70' : ''}`}
                                >
                                    {page}
                                </button>
                            ))}

                            {/* Nút sau */}
                            <button
                                disabled={pagination.CurrentPage === pagination.TotalPages}
                                onClick={() => onPageChange(pagination.CurrentPage + 1)}
                                className="px-2 py-1 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                            >
                                Sau »
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}