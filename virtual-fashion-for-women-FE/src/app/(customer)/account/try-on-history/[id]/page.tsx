'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { messageToast } from '@/helpers/toastHelper';
import { TryOnDTO } from '@/models/TryOnDTO';
import { api } from '@/api/instance';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import formatDate from '@/utils/formatDate';
import Link from 'next/link';

export default function TryOnHistoryDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [slot, setSlot] = useState<TryOnDTO>();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchDetailTryOnSlot(Number(id));
        } else {
            messageToast.error("ID lần thử trang phục không hợp lệ.");
            router.push('/account/try-on-history');
        }
    }, [id]);

    const fetchDetailTryOnSlot = async (slotId: number) => {
        try {
            setLoading(true);
            const response = await api.get(`/history-try-on/${slotId}`);
            if (response.status === 200) {
                setSlot(response.data);
            }
        } catch (error: any) {
            messageToast.error(error?.response?.data?.message);
            router.push('/account/try-on-history');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-6">
            {loading && (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size={50} />
                </div>
            )}

            {!loading && slot && (
                <>
                    {/* Back Button - Responsive */}
                    <button
                        onClick={() => router.push('/account/try-on-history')}
                        className="flex items-center gap-2 mb-4 md:mb-6 px-3 md:px-4 py-2 border border-gray-300 rounded-lg 
                                text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 text-sm md:text-base"
                    >
                        <ArrowLeft size={16} className="md:w-[18px] md:h-[18px]" />
                        <span>Quay lại</span>
                    </button>

                    {/* Date - Responsive */}
                    <p className="text-sm md:text-base text-gray-500 mb-4 md:mb-6">
                        Ngày thử: {formatDate(slot?.updatedAt)}
                    </p>

                    {/* Images Grid - Responsive */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                        {/* Original Image */}
                        <div className="flex flex-col items-center">
                            <div className="w-full flex justify-center bg-gray-50 rounded-lg p-3">
                                <img
                                    src={slot.uploadImageUrl}
                                    alt="Upload"
                                    className="max-h-[280px] sm:max-h-[320px] md:max-h-[360px] w-auto object-contain rounded-lg"
                                />
                            </div>
                            <p className="text-center text-xs md:text-sm mt-2 text-gray-600 font-medium">
                                Ảnh gốc
                            </p>
                        </div>

                        {/* Output Image */}
                        {slot.outputImageUrl && (
                            <div className="flex flex-col items-center">
                                <div className="w-full flex justify-center bg-gray-50 rounded-lg p-3">
                                    <img
                                        src={slot.outputImageUrl}
                                        alt="Output"
                                        className="max-h-[280px] sm:max-h-[320px] md:max-h-[360px] w-auto object-contain rounded-lg"
                                    />
                                </div>
                                <p className="text-center text-xs md:text-sm mt-2 text-gray-600 font-medium">
                                    Kết quả
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Product List - Responsive */}
                    {slot?.tryOnProductVariant?.length > 0 ? (
                        <div>
                            <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
                                Trang phục đã thử
                            </h2>
                            <div className="flex flex-col gap-3">
                                {slot.tryOnProductVariant.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border rounded-lg p-3 md:p-4 hover:shadow transition"
                                    >
                                        {/* Product Info */}
                                        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                                            <img
                                                src={item.productColors[0].noBgImgUrl}
                                                alt="product"
                                                className="w-16 h-16 md:w-20 md:h-20 object-contain rounded-md border flex-shrink-0"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm md:text-base line-clamp-2">
                                                    {item.productName + ` - ` + item.productColors[0].color?.colorName || 'Sản phẩm'}
                                                </p>
                                                <p className="text-xs md:text-sm text-gray-500 mt-1">
                                                    Màu: {item.productColors[0].color?.colorName || 'Không rõ'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Button */}
                                        <Link
                                            href={`/products/${item.productSlug}`}
                                            className="px-3 md:px-4 py-2 text-xs md:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center w-full sm:w-auto flex-shrink-0"
                                        >
                                            Truy cập sản phẩm
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm md:text-base">
                            Không có trang phục nào trong lần thử này.
                        </p>
                    )}
                </>
            )}
        </div>
    );
}