'use client';

import { api } from '@/api/instance';
import TransactionFilter from '@/components/Transaction/TransactionFilter';
import TransactionTable from '@/components/Transaction/TransactionTable';
import { PaginationDTO } from '@/models/PaginationDTO';
import { TransactionInformation } from '@/models/TransactionInformation';
import { set } from 'lodash';
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
            const response = await api.get('/transaction', { params: payloadPagination });
            if (response.status === 200) {

                setTransactions(response.data.data);
                setPagination((prev) => ({
                    ...prev,
                    ...response.data.data.pagination
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
        <div className="max-w-6xl mb-6 ml-0 mr-auto">
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">Lịch sử giao dịch</h1>
            <TransactionFilter
                status={statusFilter}
                onChange={setStatusFilter}
                setPagination={setPagination}
                pagination={pagination}
                isNewest={isNewest}
                onChangeSort={setIsNewest}
            />
            <TransactionTable transactions={transactions} loading={loading} />
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
    );
}
