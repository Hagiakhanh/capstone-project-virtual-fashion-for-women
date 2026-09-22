'use client';

import { useEffect, useState } from 'react';
import { api } from '@/api/instance';
import { Spin, Empty, Avatar } from 'antd';
import { StarFilled, UserOutlined } from '@ant-design/icons';

interface ResponseRatingDto {
    userName: string;
    ratingId: number;
    ratingValue: number;
    comment: string;
    createAt: string;
    productVariantName: string;
}

interface ProductRatingsProps {
    productId: string;
}

export default function ProductRatings({ productId }: ProductRatingsProps) {
    const [ratings, setRatings] = useState<ResponseRatingDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!productId) {
            setIsLoading(false);
            return;
        }

        const fetchRatings = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await api.get(
                    `/rating/all-product-rating/${productId}`
                );

                if (response.status === 200) {
                    setRatings(response.data);
                }
            } catch (err) {
                console.error('Lỗi khi tải đánh giá:', err);
                setError('Không thể tải đánh giá. Vui lòng thử lại sau.');
            } finally {
                setIsLoading(false);
            } 
        };

        fetchRatings();
    }, [productId]);

    const renderStars = (ratingValue: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }, (_, index) => (
                    <StarFilled
                        key={index}
                        // Tô màu vàng cho sao nếu index < ratingValue, ngược lại màu xám
                        style={{ color: index < ratingValue ? '#fadb14' : '#d9d9d9' }}
                    />
                ))}
            </div>
        );
    };

    // 5. Xử lý các trạng thái UI
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 py-6 sm:py-10 px-4">{error}</div>;
    }

    if (ratings.length === 0) {
        return (
            <div className="w-full sm:w-[90%] lg:w-[65%] mx-auto py-6 sm:py-10 px-4">
                <Empty description="Chưa có đánh giá nào cho sản phẩm này." />
            </div>
        );
    }

    // 6. Render danh sách đánh giá
    return (
        <div className="bg-white py-6 sm:py-10">
            <div className="w-full sm:w-[90%] lg:w-[65%] mx-auto px-4 sm:px-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
                    Đánh giá sản phẩm
                </h2>
                
                <div className="space-y-4 sm:space-y-8">
                    {ratings.map((rating) => (
                        <div
                            key={rating.ratingId}
                            className="flex gap-3 sm:gap-4 border-b border-gray-200 pb-4 sm:pb-6"
                        >
                            {/* Avatar - Ẩn trên mobile rất nhỏ, hiện từ sm trở lên */}
                            <div className="hidden xs:block flex-shrink-0">
                                <Avatar 
                                    size={32} 
                                    icon={<UserOutlined />} 
                                    className="sm:!w-10 sm:!h-10"
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                {/* Tên người dùng */}
                                <p className="font-semibold text-sm sm:text-base truncate">
                                    {rating.userName}
                                </p>

                                {/* Số sao */}
                                <div className="my-1 sm:my-2">
                                    {renderStars(rating.ratingValue)}
                                </div>

                                {/* Thông tin thời gian và phân loại */}
                                <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1 sm:mt-2">
                                    <span className="block xs:inline">
                                        {new Date(rating.createAt).toLocaleString('vi-VN', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                    <span className="hidden xs:inline">&nbsp;|&nbsp;</span>
                                    <span className="block xs:inline mt-1 xs:mt-0">
                                        Phân loại: {rating.productVariantName}
                                    </span>
                                </p>

                                {/* Nội dung đánh giá */}
                                <p className="mt-2 sm:mt-3 text-gray-900 text-sm sm:text-base break-words">
                                    {rating.comment}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}