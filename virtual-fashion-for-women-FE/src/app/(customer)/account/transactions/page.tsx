'use client';

import { api } from '@/api/instance';
import TransactionFilter from '@/components/Transaction/TransactionFilter';
import TransactionTable from '@/components/Transaction/TransactionTable';
import { PaginationDTO } from '@/models/PaginationDTO';
import { TransactionInformation } from '@/models/TransactionInformation';
import React, { useEffect, useState } from 'react';

export default function TransactionPage() {
    const [transactions, setTransactions] = useState<TransactionInformation[]>([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [isNewest, setIsNewest] = useState(true);
    const [pagination, setPagination] = useState<PaginationDTO>({
        CurrentPage: 1,
        HasNext: false,
        HasPrevious: false,
        PageSize: 6,
        TotalCount: 0,
        TotalPages: 0,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, [pagination.CurrentPage, pagination.PageSize, statusFilter, isNewest]);

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const payloadPagination = {
                pageSize: pagination.PageSize,
                pageNumber: pagination.CurrentPage,
                statusFilter: statusFilter,
                isDescesing: isNewest
            }
            const response = await api.get('/transaction/transaction-history', { params: payloadPagination });
            if (response.status === 200) {
                setTransactions(response.data.data);
                setPagination((prev) => ({
                    ...prev,
                    ...response.data.pagination
                }));
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu giao dịch:', error);
        } finally {
            setLoading(false);
        }
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

    return (
        <div className="max-w-6xl w-full ml-0 mr-auto">
            {/* Title - Responsive */}
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4 md:mb-6">
                Lịch sử giao dịch
            </h1>

            {/* Filter - Responsive */}
            <TransactionFilter
                status={statusFilter}
                onChange={setStatusFilter}
                setPagination={setPagination}
                pagination={pagination}
                isNewest={isNewest}
                onChangeSort={setIsNewest}
            />

            {/* Table - Responsive */}
            <TransactionTable transactions={transactions} loading={loading} />

            {/* Pagination - Responsive */}
            {pagination.TotalPages > 1 && (
                <div className="flex justify-center items-center gap-1.5 md:gap-3 flex-wrap px-2 mt-6">
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
    );
}