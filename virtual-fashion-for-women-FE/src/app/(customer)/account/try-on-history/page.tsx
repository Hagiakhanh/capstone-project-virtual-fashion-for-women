'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { TryOnDTO } from '@/models/TryOnDTO';
import { api } from '@/api/instance';
import { PaginationDTO } from '@/models/PaginationDTO';
import { messageToast } from '@/helpers/toastHelper';
import formatDate from '@/utils/formatDate';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';

export default function TryOnHistoryListPage() {
    const [data, setData] = useState<TryOnDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<PaginationDTO>({
        CurrentPage: 1,
        HasNext: false,
        HasPrevious: false,
        PageSize: 6,
        TotalCount: 0,
        TotalPages: 0,
    });

    useEffect(() => {
        fetchTryOnHistory();
    }, [pagination.CurrentPage]);

    const fetchTryOnHistory = async () => {
        try {
            setLoading(true);
            const payload = {
                pageSize: pagination.PageSize,
                pageNumber: pagination.CurrentPage,
            };
            const response = await api.get(`/history-try-on`, { params: payload });
            if (response.status === 200) {
                setData(response.data.data);
                setPagination((prev) => ({
                    ...prev,
                    ...response.data.pagination
                }));
            }
        } catch (error: any) {
            console.error("Lỗi khi lấy lịch sử thử trang phục:", error);
            messageToast.error(error?.response?.data?.message);
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
        if (left > 2) range.push("...");
        for (let i = left; i <= right; i++) range.push(i);
        if (right < totalPages - 1) range.push("...");
        if (totalPages > 1) range.push(totalPages);
        return range;
    }

    return (
        <div className="max-w-7xl mx-auto">
            {/* Title - Responsive */}
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4 md:mb-6">
                Lịch sử thử đồ
            </h1>

            {loading ? (
                <div className="flex justify-center py-12 md:py-20">
                    <LoadingSpinner size={60} />
                </div>
            ) : data.length === 0 ? (
                <div className="text-center text-gray-500 mt-8 md:mt-10 text-sm md:text-base">
                    Bạn chưa có lần thử trang phục nào.
                </div>
            ) : (
                <>
                    {/* Grid - Responsive */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {data.map((slot) => (
                            <div
                                key={slot.tryOnSlotId}
                                className="bg-white border border-gray-200 rounded-xl md:rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
                            >
                                <div className="p-4 md:p-5 flex flex-col flex-1">
                                    {/* Header */}
                                    <div className="flex flex-col gap-1 mb-3">
                                        <h2 className="text-base md:text-lg font-medium text-gray-800 line-clamp-2">
                                            Thử vào lúc: {formatDate(slot.updatedAt)}
                                        </h2>
                                    </div>

                                    {/* Image - Responsive height */}
                                    <div className="relative flex justify-center items-center bg-gray-50 rounded-xl h-[220px] sm:h-[240px] md:h-[260px] mb-3 md:mb-4">
                                        <img
                                            src={slot.outputImageUrl}
                                            alt="Try-on result"
                                            className="max-h-full max-w-full object-contain rounded-lg"
                                        />
                                    </div>

                                    {/* Footer - Button */}
                                    <div className="mt-auto flex justify-end">
                                        <Link
                                            href={`/account/try-on-history/${slot.tryOnSlotId}`}
                                            className="inline-flex items-center justify-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 transition-all w-full sm:w-auto"
                                        >
                                            <Eye size={16} className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                            Xem chi tiết
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination - Responsive */}
                    {pagination.TotalPages > 1 && (
                        <div className="flex justify-center items-center gap-1.5 md:gap-3 mt-6 md:mt-10 flex-wrap">
                            <button
                                disabled={pagination.CurrentPage === 1}
                                onClick={() => handlePageChange(pagination.CurrentPage - 1)}
                                className="px-2.5 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-lg border text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
                                    onClick={() => typeof page === "number" && handlePageChange(page)}
                                    disabled={page === "..."}
                                    className={`px-2.5 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-lg border transition-all min-w-[32px] md:min-w-[40px] ${pagination.CurrentPage === page
                                        ? 'bg-black text-white border-black shadow'
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                                        } ${page === "..." ? "cursor-default opacity-70" : ""}`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                disabled={pagination.CurrentPage === pagination.TotalPages}
                                onClick={() => handlePageChange(pagination.CurrentPage + 1)}
                                className="px-2.5 py-1.5 md:px-4 md:py-2 text-xs md:text-sm rounded-lg border text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <span className="hidden sm:inline">Sau »</span>
                                <span className="sm:hidden">»</span>
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}