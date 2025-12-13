'use client';
import { useState, useEffect, useMemo } from 'react';
import { ChevronUp, ChevronDown, Check, X, ArrowDownUp, RefreshCw, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { WithdrawTransaction } from '@/models/WithdrawTransaction';
import { api } from '@/api/instance';
import formatPrice from '@/utils/formatPrice';
import formatDate from '@/utils/formatDate';
import { PaginationDTO } from '@/models/PaginationDTO';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';

type SortOrder = 'newest' | 'oldest';

export default function WithdrawTransactionAdmin() {
    const [transactions, setTransactions] = useState<WithdrawTransaction[]>([]);
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [pagination, setPagination] = useState<PaginationDTO>({
        CurrentPage: 1,
        HasNext: false,
        HasPrevious: false,
        PageSize: 5,
        TotalCount: 0,
        TotalPages: 0,
    });
    const [isNewest, setIsNewest] = useState<boolean>(true);

    useEffect(() => {
        fetchTransactions();
    }, [pagination.CurrentPage, pagination.PageSize, isNewest, statusFilter]);

    const statusTabs = [
        { key: '', label: 'Tất cả', icon: null, color: 'gray' },
        { key: 'Pending', label: 'Đang xử lý', icon: Clock, color: 'amber' },
        { key: 'Success', label: 'Thành công', icon: CheckCircle2, color: 'emerald' },
        { key: 'Failed', label: 'Thất bại', icon: XCircle, color: 'red' },
    ];

    const paginationDelta = useMemo(() => {
        if (typeof window === 'undefined') return 2;
        return window.innerWidth < 640 ? 1 : 2;
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const payloadPagination = {
                pageSize: pagination.PageSize,
                pageNumber: pagination.CurrentPage,
                status: statusFilter,
                isDescending: isNewest
            }
            const response = await api.get('/transaction/withdraw-transactions', { params: payloadPagination });
            if (response.status === 200) {
                setTransactions(response.data.data);
                setPagination((prev) => ({
                    ...prev,
                    ...response.data.pagination
                }));
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSortToggle = () => {
        if (setIsNewest) {
            setIsNewest(!isNewest);
            setPagination({ ...pagination, CurrentPage: 1 });
        }
    };

    const handleAccept = async (transactionId: number) => {
        setActionLoading(transactionId);
        try {
            const response = await api.post(`/transaction/${transactionId}/accept`);
            if (response.status === 200) {
                await fetchTransactions();
            }
        } catch (error) {
            console.error('Lỗi khi chấp nhận giao dịch:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRefuse = async (transactionId: number) => {
        setActionLoading(transactionId);
        try {
            const response = await api.post(`/transaction/${transactionId}/refuse`);
            if (response.status === 200) {
                await fetchTransactions();
            }
        } catch (error) {
            console.error('Lỗi khi từ chối giao dịch:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-amber-50 text-amber-700 border border-amber-200';
            case 'failed':
                return 'bg-red-50 text-red-700 border border-red-200';
            case 'success':
                return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
            default:
                return 'bg-gray-50 text-gray-700 border border-gray-200';
        }
    };

    const getStatusName = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'Đang xử lý';
            case 'failed':
                return 'Thất bại';
            case 'success':
                return 'Thành công';
            default:
                return status;
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.TotalPages) {
            setPagination((prev) => ({ ...prev, CurrentPage: newPage }));
        }
    };

    const handleStatusChange = (newStatus: string) => {
        setStatusFilter(newStatus);
        setPagination({ ...pagination, CurrentPage: 1 });
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 p-6">
            <div className="">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Quản Lý Rút Tiền</h1>
                    <p className="text-gray-600">Xử lý và quản lý các yêu cầu rút tiền của người dùng</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">

                    {/* Top Controls */}
                    <div className="border-b border-gray-100 px-6 py-5 space-y-4">

                        {/* First Row: Sort + Refresh */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <button
                                onClick={handleSortToggle}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <ArrowDownUp
                                    size={18}
                                    className={`text-indigo-600 transition-transform duration-300 ${isNewest ? 'rotate-0' : 'rotate-180'}`}
                                />
                                <span className="font-medium text-gray-700">{isNewest ? 'Mới nhất' : 'Cũ nhất'}</span>
                            </button>

                            <button
                                onClick={fetchTransactions}
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                            >
                                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                                {loading ? 'Đang tải...' : 'Làm mới'}
                            </button>
                        </div>

                        {/* Second Row: Status Filter Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {statusTabs.map((tab) => {
                                const Icon = tab.icon;
                                const active = statusFilter === tab.key;

                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => handleStatusChange(tab.key)}
                                        className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-lg font-medium text-sm transition-all duration-200 flex-shrink-0 whitespace-nowrap ${active
                                            ? 'bg-black text-white border-black shadow-md'
                                            : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        {Icon && <Icon size={18} />}
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Table Section */}
                    {loading ? (
                        <div className="p-12">
                            <LoadingSpinner />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            {transactions.length === 0 ? (
                                <div className="text-center py-16 text-gray-500">
                                    <div className="text-6xl mb-4">📭</div>
                                    <p className="text-lg font-medium">Không có giao dịch nào</p>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ID</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Người dùng</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ngân hàng</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Số tài khoản</th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Số tiền</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phương thức</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Trạng thái</th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ngày tạo</th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {transactions.map((t) => (
                                            <tr key={t.transactionId} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-transparent transition-colors duration-150">
                                                <td className="px-6 py-4 text-sm font-semibold text-indigo-600">#{t.transactionId}</td>
                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{t.userName}</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{t.bankName}</td>
                                                <td className="px-6 py-4 text-sm font-mono text-gray-600">{t.bankAccountNumber}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{formatPrice(t.money ?? 0)} ₫</td>
                                                <td className="px-6 py-4 text-sm text-gray-700">{t.method}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(t.status)}`}>
                                                        {getStatusName(t.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{formatDate(t.createdAt)}</td>
                                                <td className="px-6 py-4">
                                                    {t.status.toLowerCase() === 'pending' ? (
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                onClick={() => handleAccept(t.transactionId)}
                                                                disabled={actionLoading === t.transactionId}
                                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                                            >
                                                                <Check size={16} />
                                                                <span className="hidden sm:inline">Chấp nhận</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleRefuse(t.transactionId)}
                                                                disabled={actionLoading === t.transactionId}
                                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                                            >
                                                                <X size={16} />
                                                                <span className="hidden sm:inline">Từ chối</span>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center">
                                                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">Đã xử lý</span>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination.TotalPages > 0 && (
                        <div className="border-t border-gray-100 bg-gray-50 px-6 py-6">
                            <div className="flex justify-center items-center flex-wrap gap-2">
                                {/* Previous Button */}
                                <button
                                    disabled={pagination.CurrentPage === 1}
                                    onClick={() => handlePageChange(pagination.CurrentPage - 1)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 hover:border-gray-400 text-gray-700 font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ← Trước
                                </button>

                                {/* Page Numbers */}
                                <div className="flex gap-1">
                                    {getPageNumbers(pagination.TotalPages, pagination.CurrentPage, paginationDelta)
                                        .map((page, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => typeof page === 'number' && handlePageChange(page)}
                                                disabled={page === '...'}
                                                className={`px-3.5 py-2 rounded-lg font-medium text-sm transition-all duration-200 min-w-[40px]
                                                    ${pagination.CurrentPage === page
                                                        ? 'bg-indigo-600 text-white shadow-md border border-indigo-600'
                                                        : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-100'
                                                    }
                                                    ${page === '...' ? 'opacity-50 cursor-default hover:bg-white' : ''}`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                </div>

                                {/* Next Button */}
                                <button
                                    disabled={pagination.CurrentPage === pagination.TotalPages}
                                    onClick={() => handlePageChange(pagination.CurrentPage + 1)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-100 hover:border-gray-400 text-gray-700 font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Sau →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}