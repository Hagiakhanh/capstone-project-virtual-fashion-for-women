'use client';

import { useEffect, useState } from 'react';
import { Card, Empty, Button } from 'antd';
import { ResponseNotification } from '@/models/NotificationDTO';
import formatDate from '@/utils/formatDate';
import { CheckOutlined } from '@ant-design/icons';
import { PaginationDTO } from '@/models/PaginationDTO';
import { api } from '@/api/instance';
import { messageToast } from '@/helpers/toastHelper';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';

export default function NotificationPage() {
    const [notifications, setNotifications] = useState<ResponseNotification[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [unReadCount, setUnReadCount] = useState<number>(0);
    const [pagination, setPagination] = useState<PaginationDTO>({
        CurrentPage: 1,
        HasNext: false,
        HasPrevious: false,
        PageSize: 6,
        TotalCount: 0,
        TotalPages: 0,
    });

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const payloadPagination = {
                pageSize: pagination.PageSize,
                pageNumber: pagination.CurrentPage,
            }
            const response = await api.get("/notification", { params: payloadPagination });
            if (response.status === 200) {
                setNotifications(response.data.data);
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

    const fetchUnreadNotificationCount = async () => {
        try {
            const response = await api.get('/notification/unread-count');

            if (response.status === 200) {
                setUnReadCount(response.data.data);
            }
        } catch (error) {
            console.error("Lỗi khi lấy số lượng thông báo chưa đọc:", error);
        }
    }

    const markAllAsRead = async () => {
        try {
            const response = await api.put('/notification');
            if (response.status === 200) {
                setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                window.dispatchEvent(new Event("notification-updated"));
                setUnReadCount(0);
            }
        } catch (error) {
            console.error("Lỗi khi đánh dấu tất cả đã đọc:", error);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            const response = await api.get(`/notification/${id}`);
            if (response.status === 200) {
                const data: ResponseNotification = response.data;
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.notificationId === data.notificationId
                            ? { ...n, ...data }
                            : n
                    )
                );
                window.dispatchEvent(new Event("notification-updated"));
            }
        } catch (error: any) {
            console.error("Lỗi khi đánh dấu thông báo đã đọc:", error);
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

    useEffect(() => {
        fetchUnreadNotificationCount();
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [pagination.CurrentPage, pagination.PageSize]);

    return (
        <div className="w-full">
            {/* Header - Responsive */}
            <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2">Thông báo</h1>
                    {!loading && unReadCount > 0 && (
                        <p className="text-sm md:text-base text-gray-600">
                            Bạn có <span className="font-semibold">{unReadCount}</span> thông báo chưa đọc
                        </p>
                    )}
                </div>

                {!loading && unReadCount > 0 && (
                    <Button
                        type="primary"
                        onClick={markAllAsRead}
                        icon={<CheckOutlined />}
                        className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                        size="middle"
                    >
                        <span className="hidden sm:inline">Đánh dấu tất cả đã đọc</span>
                        <span className="sm:hidden">Đọc tất cả</span>
                    </Button>
                )}
            </div>

            {/* Loading */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size={50} />
                </div>
            ) : notifications.length === 0 ? (
                <Card className="text-center py-12 md:py-16 border-0 shadow-sm">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div className="text-gray-500">
                                <p className="font-medium text-sm md:text-base">Chưa có thông báo</p>
                                <p className="text-xs md:text-sm mt-1">Chúng tôi sẽ gửi khi có cập nhật mới</p>
                            </div>
                        }
                    />
                </Card>
            ) : (
                <>
                    {/* Danh sách thông báo - Responsive */}
                    <div className="space-y-3 md:space-y-5 mb-6 md:mb-10">
                        {notifications.map((n) => {
                            const isUnread = !n.isRead;

                            return (
                                <Card
                                    key={n.notificationId}
                                    onClick={() => markAsRead(n.notificationId)}
                                    className={`cursor-pointer border transition-all rounded-xl px-3 py-3 md:px-5 md:py-4 hover:shadow-md
                                        ${isUnread
                                            ? 'border-blue-400 bg-white hover:border-blue-500'
                                            : 'border-gray-200 bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    <div className="flex gap-3 md:gap-4">
                                        {/* Dấu chấm chưa đọc */}
                                        {isUnread ? (
                                            <div className="flex-shrink-0 w-2 h-2 md:w-2.5 md:h-2.5 bg-blue-500 rounded-full mt-1.5 md:mt-2"></div>
                                        ) : (
                                            <div className="w-2 md:w-2.5"></div>
                                        )}

                                        {/* Nội dung */}
                                        <div className="flex-1 min-w-0">
                                            <h3
                                                className={`text-sm md:text-base font-semibold leading-snug ${isUnread ? 'text-gray-900' : 'text-gray-800'
                                                    }`}
                                            >
                                                {n.title}
                                            </h3>
                                            <p
                                                className={`mt-1 text-xs md:text-sm leading-relaxed ${isUnread ? 'text-gray-700' : 'text-gray-700'
                                                    }`}
                                            >
                                                {n.content}
                                            </p>
                                            <p className="mt-1.5 md:mt-2 text-[10px] md:text-xs text-gray-500">
                                                {formatDate(n.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Phân trang - Responsive */}
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

                        {getPageNumbers(pagination.TotalPages, pagination.CurrentPage, window.innerWidth < 640 ? 1 : 2).map((page, idx) => (
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
                </>
            )}
        </div>
    );
}