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

    return (
        <div className="flex flex-wrap gap-3 mb-6 items-center">
            {/* Nút sắp xếp theo ngày (đặt bên trái) */}
            <button
                onClick={handleSortToggle}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 shadow-sm transition-all`}
                title={`Sắp xếp theo ngày ${isNewest ? 'mới nhất → cũ nhất' : 'cũ nhất → mới nhất'}`}
            >
                <ArrowDownUp
                    size={18}
                    className={`transition-transform duration-300 ${isNewest ? 'rotate-0' : 'rotate-180'}`}
                />
                <span className="text-sm font-medium">
                    {isNewest ? 'Mới nhất' : 'Cũ nhất'}
                </span>
            </button>

            {/* Bộ lọc trạng thái */}
            <div className="flex flex-wrap gap-3">
                {statusTabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = status === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => {
                                onChange(tab.key);
                                setPagination({ ...pagination, CurrentPage: 1 });
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
        </div>
    );
}
