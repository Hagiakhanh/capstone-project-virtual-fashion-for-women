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
        <>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-800 mb-6">Thông báo</h1>
                    {!loading && unReadCount > 0 && (
                        <p className="text-gray-600 mt-1">
                            Bạn có <span className="font-semibold">{unReadCount}</span> thông báo chưa đọc
                        </p>
                    )}
                </div>

                {!loading && unReadCount > 0 && (
                    <Button
                        type="primary"
                        onClick={markAllAsRead}
                        icon={<CheckOutlined />}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Đánh dấu tất cả đã đọc
                    </Button>
                )}
            </div>

            {/* Loading */}
            {loading ? (
                <LoadingSpinner size={50} />
            ) : notifications.length === 0 ? (
                <Card className="text-center py-16 border-0 shadow-sm">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div className="text-gray-500">
                                <p className="font-medium">Chưa có thông báo</p>
                                <p className="text-sm mt-1">Chúng tôi sẽ gửi khi có cập nhật mới</p>
                            </div>
                        }
                    />
                </Card>
            ) : (
                <>
                    {/* Danh sách thông báo */}
                    <div className="space-y-5 mb-10">
                        {notifications.map((n) => {
                            const isUnread = !n.isRead;

                            return (
                                <Card
                                    key={n.notificationId}
                                    onClick={() => markAsRead(n.notificationId)}
                                    className={`cursor-pointer border transition-all rounded-xl px-5 py-4 hover:shadow-md
                                        ${isUnread
                                            ? 'border-blue-400 bg-white hover:border-blue-500'
                                            : 'border-gray-200 bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    <div className="flex gap-4">
                                        {/* Dấu chấm chưa đọc */}
                                        {isUnread ? (
                                            <div className="flex-shrink-0 w-2.5 h-2.5 bg-blue-500 rounded-full mt-2"></div>
                                        ) : (
                                            <div className="w-2.5"></div>
                                        )}

                                        {/* Nội dung */}
                                        <div className="flex-1 min-w-0">
                                            <h3
                                                className={`text-base font-semibold leading-snug ${isUnread ? 'text-gray-900' : 'text-gray-800'
                                                    }`}
                                            >
                                                {n.title}
                                            </h3>
                                            <p
                                                className={`mt-1 text-sm leading-relaxed ${isUnread ? 'text-gray-700' : 'text-gray-700'
                                                    }`}
                                            >
                                                {n.content}
                                            </p>
                                            <p className="mt-2 text-xs text-gray-500">{formatDate(n.createdAt)}</p>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Phân trang */}
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
                </>
            )}
        </>
    );
}
