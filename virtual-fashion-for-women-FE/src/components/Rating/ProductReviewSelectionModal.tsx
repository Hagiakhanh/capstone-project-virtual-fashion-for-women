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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-lg shadow-xl relative max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header với nút đóng */}
                <div className="flex items-start justify-between mb-3 sm:mb-4 pr-8">
                    <h2 className="text-lg sm:text-xl font-semibold leading-tight">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-700 hover:text-gray-900 cursor-pointer transition-colors"
                        aria-label="Đóng"
                    >
                        <X size={20} className="sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Danh sách sản phẩm - scrollable */}
                <div className="space-y-2 sm:space-y-3 overflow-y-auto flex-1 -mx-4 px-4 sm:-mx-6 sm:px-6">
                    {detailsToShow.length > 0 ? (
                        detailsToShow.map((detail) => (
                            <div
                                key={detail.orderDetailId}
                                className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg"
                            >
                                {/* Thông tin sản phẩm */}
                                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 w-full xs:w-auto">
                                    <img
                                        src={detail.responseProductVariantDto.imageUrl}
                                        alt={detail.responseProductVariantDto.variantName}
                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-md object-cover flex-shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm sm:text-base text-gray-800 line-clamp-2">
                                            {detail.responseProductVariantDto.variantName}
                                        </p>
                                        {/* Hiển thị số lượng trên mobile nếu cần */}
                                        <p className="text-xs text-gray-500 mt-0.5 xs:hidden">
                                            Số lượng: {detail.quantity}
                                        </p>
                                    </div>
                                </div>

                                {/* Nút action */}
                                <button
                                    onClick={() => onSelectProduct(detail)}
                                    className={`w-full xs:w-auto px-3 sm:px-4 py-2 rounded-lg text-white text-xs sm:text-sm font-medium transition-all cursor-pointer active:scale-95 whitespace-nowrap flex-shrink-0 ${
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
                        <div className="flex items-center justify-center py-8 sm:py-10">
                            <p className="text-sm sm:text-base text-gray-500 text-center">
                                {emptyMessage}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}