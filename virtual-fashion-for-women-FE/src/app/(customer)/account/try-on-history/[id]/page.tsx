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
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            {loading && <LoadingSpinner size={50} />}
            {!loading && slot && (
                <>
                    <button
                        onClick={() => router.push('/account/try-on-history')}
                        className="flex items-center gap-2 mb-6 px-4 py-2 border border-gray-300 rounded-lg 
                                text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
                    >
                        <ArrowLeft size={18} />
                        <span>Quay lại</span>
                    </button>
                    <p className="text-base text-gray-500 mb-6">
                        Ngày thử: {formatDate(slot?.updatedAt)}
                    </p>

                    {/* Hai ảnh: ảnh gốc và kết quả */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="flex flex-col items-center">
                            <div className="w-full flex justify-center bg-gray-50 rounded-lg p-3">
                                <img
                                    src={slot.uploadImageUrl}
                                    alt="Upload"
                                    className="max-h-[360px] w-auto object-contain rounded-lg"
                                />
                            </div>
                            <p className="text-center text-sm mt-2 text-gray-600 font-medium">
                                Ảnh gốc
                            </p>
                        </div>

                        {slot.outputImageUrl && (
                            <div className="flex flex-col items-center">
                                <div className="w-full flex justify-center bg-gray-50 rounded-lg p-3">
                                    <img
                                        src={slot.outputImageUrl}
                                        alt="Output"
                                        className="max-h-[360px] w-auto object-contain rounded-lg"
                                    />
                                </div>
                                <p className="text-center text-sm mt-2 text-gray-600 font-medium">
                                    Kết quả
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Danh sách trang phục */}
                    {slot?.tryOnProductVariant?.length > 0 ? (
                        <div>
                            <h2 className="text-lg font-semibold mb-3">Trang phục đã thử</h2>
                            <div className="flex flex-col gap-3">
                                {slot.tryOnProductVariant.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between border rounded-lg p-3 hover:shadow transition"
                                    >
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={item.productColors[0].noBgImgUrl}
                                                alt="product"
                                                className="w-20 h-20 object-contain rounded-md border"
                                            />
                                            <div>
                                                <p className="font-medium">
                                                    {item.productName + ` - ` + item.productColors[0].color?.colorName || 'Sản phẩm'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Màu: {item.productColors[0].color?.colorName || 'Không rõ'}
                                                </p>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/products/${item.productSlug}`}
                                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                        >
                                            Truy cập sản phẩm
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">Không có trang phục nào trong lần thử này.</p>
                    )}
                </>
            )}
        </div>
    );
}
