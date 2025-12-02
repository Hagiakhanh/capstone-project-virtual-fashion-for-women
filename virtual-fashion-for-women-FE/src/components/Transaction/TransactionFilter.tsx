'use client';

import { PaginationDTO } from '@/models/PaginationDTO';
import { CheckCircle2, Clock, XCircle, ArrowDownUp } from 'lucide-react';
import React from 'react';

interface Props {
    status: string;
    onChange: (status: string) => void;
    setPagination: (pagination: PaginationDTO) => void;
    pagination: PaginationDTO;
    isNewest: boolean;
    onChangeSort?: (isNewest: boolean) => void;
}

export default function TransactionFilter({
    status,
    onChange,
    setPagination,
    pagination,
    isNewest,
    onChangeSort
}: Props) {
    const statusTabs = [
        { key: '', label: 'Tất cả', icon: null },
        { key: 'Pending', label: 'Đang xử lý', icon: Clock },
        { key: 'Success', label: 'Thành công', icon: CheckCircle2 },
        { key: 'Failed', label: 'Thất bại', icon: XCircle },
    ];

    const handleSortToggle = () => {
        if (onChangeSort) {
            onChangeSort(!isNewest);
            setPagination({ ...pagination, CurrentPage: 1 });
        }
    };

    const handleStatusChange = (newStatus: string) => {
        onChange(newStatus);
        setPagination({ ...pagination, CurrentPage: 1 });
    };

    return (
        <div className="mb-4 md:mb-6">
            {/* Sort button - Full width on mobile */}
            <div className="mb-3 md:mb-4">
                <button
                    onClick={handleSortToggle}
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 shadow-sm transition-all w-full sm:w-auto"
                    title={`Sắp xếp theo ngày ${isNewest ? 'mới nhất → cũ nhất' : 'cũ nhất → mới nhất'}`}
                >
                    <ArrowDownUp
                        size={16}
                        className={`md:w-[18px] md:h-[18px] transition-transform duration-300 ${isNewest ? 'rotate-0' : 'rotate-180'
                            }`}
                    />
                    <span className="text-xs md:text-sm font-medium">
                        {isNewest ? 'Mới nhất' : 'Cũ nhất'}
                    </span>
                </button>
            </div>

            {/* Status filters - Horizontal scroll on mobile with indicators */}
            <div className="-mx-4 px-4 md:mx-0 md:px-0 relative">
                {/* Scroll indicator - Right shadow */}
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none z-10 md:hidden"></div>

                <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
                    {statusTabs.map((tab) => {
                        const Icon = tab.icon;
                        const active = status === tab.key;

                        return (
                            <button
                                key={tab.key}
                                onClick={() => handleStatusChange(tab.key)}
                                className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-full border transition-all flex-shrink-0 snap-start ${active
                                    ? 'bg-black text-white border-black shadow'
                                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100 active:scale-95'
                                    }`}
                            >
                                {Icon && <Icon size={16} className="md:w-[18px] md:h-[18px]" />}
                                <span className="text-xs md:text-sm font-medium whitespace-nowrap">
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                    {/* Padding element to ensure last item is visible */}
                    <div className="w-4 flex-shrink-0 md:hidden"></div>
                </div>
            </div>
        </div>
    );
}