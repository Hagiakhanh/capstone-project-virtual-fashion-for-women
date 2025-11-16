'use client';

import { OrderDetailDTO } from '@/models/OrderDetailDTO'; 
import { X } from 'lucide-react';
import React from 'react';

interface ProductReviewSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectProduct: (orderDetail: OrderDetailDTO) => void;
    orderDetails: OrderDetailDTO[];
    mode?: 'review' | 'edit'; // Thêm 'mode' prop
}

export default function ProductReviewSelectionModal({
    isOpen,
    onClose,
    onSelectProduct,
    orderDetails,
    mode = 'review', // Mặc định là 'review'
}: ProductReviewSelectionModalProps) {
    if (!isOpen) return null;

    // Lọc sản phẩm dựa trên 'mode'
    const detailsToShow = orderDetails.filter(detail =>
        mode === 'review' ? !detail.isReviewed : detail.isReviewed
    );

    const title = mode === 'review' 
        ? "Bạn muốn đánh giá sản phẩm nào?" 
        : "Bạn muốn xem/sửa đánh giá nào?";
        
    const buttonText = mode === 'review' ? "Đánh giá" : "Xem/Sửa";

    const emptyMessage = mode === 'review'
        ? "Tất cả sản phẩm đã được đánh giá."
        : "Chưa có sản phẩm nào được đánh giá.";

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                    <X size={24} />
                </button>

                <h2 className="text-xl font-semibold mb-4">{title}</h2>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {detailsToShow.length > 0 ? (
                        detailsToShow.map((detail) => (
                            <div
                                key={detail.orderDetailId}
                                className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <img
                                        src={detail.responseProductVariantDto.imageUrl}
                                        alt={detail.responseProductVariantDto.variantName}
                                        className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 truncate">
                                            {detail.responseProductVariantDto.variantName}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onSelectProduct(detail)}
                                    className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-all cursor-pointer${
                                        mode === 'review' 
                                        ? 'bg-red-500 hover:bg-red-600' 
                                        : 'bg-blue-500 hover:bg-blue-600'
                                    }`}
                                >
                                    {buttonText}
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">
                            {emptyMessage}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}