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
            <div className="flex items-center">
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
        return <div className="text-center text-red-500 py-10">{error}</div>;
    }

    if (ratings.length === 0) {
        return (
            <div className="w-[65%] mx-auto py-10">
                <Empty description="Chưa có đánh giá nào cho sản phẩm này." />
            </div>
        );
    }

    // 6. Render danh sách đánh giá
    return (
        <div className="bg-white py-10">
            <div className="w-[65%] mx-auto">
                <h2 className="text-2xl font-bold mb-6">Đánh giá sản phẩm</h2>
                <div className="space-y-8">
                    {ratings.map((rating) => (
                        <div
                            key={rating.ratingId}
                            className="flex gap-4 border-b border-gray-200 pb-6"
                        >
                            <Avatar size={40} icon={<UserOutlined />} />

                            <div className="flex-1">
                                <p className="font-semibold text-base">{rating.userName}</p>

                                {renderStars(rating.ratingValue)}

                                <p className="text-base text-gray-600 mt-2">
                                  {new Date(rating.createAt).toLocaleString('vi-VN')}
                                  &nbsp;|&nbsp;Phân loại hàng: {rating.productVariantName}
                                </p>

                                <p className="mt-3 text-gray-900 text-base">{rating.comment}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}