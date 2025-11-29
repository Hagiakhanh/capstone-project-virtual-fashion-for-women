'use client';

import { Calendar, CheckCircle, Clock, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { OrderDTO } from '@/models/OrderDTO';
import formatPrice from '@/utils/formatPrice';
import statusMap from '@/helpers/statusMapper';
import formatDate from '@/utils/formatDate';

import { useEffect, useState } from 'react';
import QuickRating from '@/components/Rating/QuickRating';
import RatingModal from '@/components/Rating/RatingModal';
import ProductReviewSelectionModal from '@/components/Rating/ProductReviewSelectionModal';
import { OrderDetailDTO } from '@/models/OrderDetailDTO';

export default function OrderItem({ order }: { order: OrderDTO }) {
    const router = useRouter();
    const statusInfo = statusMap[order.status] || {
        label: 'Không xác định',
        color: '#7F8C8D',
        bg: '#ECF0F1',
        icon: Clock,
    };

    const StatusIcon = statusInfo.icon;

    const productCount = order.responseOrderDetails.length;
    const firstProduct = order.responseOrderDetails[0]?.responseProductVariantDto;
    const firstName = firstProduct?.variantName || 'Sản phẩm';

    const [selectionModalOpen, setSelectionModalOpen] = useState(false);
    const [selectionEditModalOpen, setSelectionEditModalOpen] = useState(false);
    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState<OrderDetailDTO | null>(null);
    const [initialRating, setInitialRating] = useState(0);
    const [allReviewed, setAllReviewed] = useState(false);
    const [localOrderDetails, setLocalOrderDetails] = useState(order.responseOrderDetails);

    useEffect(() => {
        const checkAllReviewed = localOrderDetails.every(detail => detail.isReviewed);
        setAllReviewed(checkAllReviewed);
    }, [localOrderDetails]);

    const handleOpenReviewFlow = (rating: number) => {
        setInitialRating(rating);
        const unreviewedDetails = localOrderDetails.filter(d => !d.isReviewed);

        if (unreviewedDetails.length === 0) {
            setAllReviewed(true);
            return;
        }

        if (unreviewedDetails.length === 1) {
            setSelectedDetail(unreviewedDetails[0]);
            setRatingModalOpen(true);
        } else {
            setSelectionModalOpen(true);
        }
    };

    const handleProductSelected = (detail: OrderDetailDTO) => {
        setSelectedDetail(detail);
        setSelectionModalOpen(false);
        setRatingModalOpen(true);
    };

    const handleOpenEditFlow = () => {
        setSelectionEditModalOpen(true);
    };

    const handleProductSelectedForEdit = (detail: OrderDetailDTO) => {
        setInitialRating(0);
        setSelectedDetail(detail);
        setSelectionEditModalOpen(false);
        setRatingModalOpen(true);
    };

    const handleReviewSuccess = () => {
        setRatingModalOpen(false);

        if (selectedDetail && !selectedDetail.isReviewed) {
            setLocalOrderDetails(prevDetails =>
                prevDetails.map(d =>
                    d.orderDetailId === selectedDetail.orderDetailId
                        ? { ...d, isReviewed: true }
                        : d
                )
            );
        }

        setSelectedDetail(null);
    };

    const handleCloseRatingModal = () => {
        setRatingModalOpen(false);
        setSelectedDetail(null);
    };

    const canReview = order.status === 'Completed';

    return (
        <>
            <div className="w-full bg-white rounded-xl md:rounded-2xl shadow-sm border p-4 md:p-6 mb-3 md:mb-4 hover:shadow-md transition-all">
                {/* Header - Responsive */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2 md:mb-3">
                            <span className="font-bold text-base md:text-lg">
                                ORD-{order.orderId}
                            </span>
                            <div className="flex items-center gap-1.5 md:gap-2">
                                <div
                                    className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full flex-shrink-0"
                                    style={{ backgroundColor: statusInfo.bg }}
                                >
                                    <StatusIcon size={14} color={statusInfo.color} className="md:w-4 md:h-4" />
                                </div>
                                <span
                                    className="text-xs md:text-sm font-medium whitespace-nowrap"
                                    style={{ color: statusInfo.color }}
                                >
                                    {statusInfo.label}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 md:gap-6 text-xs md:text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-gray-400 flex-shrink-0 md:w-[18px] md:h-[18px]" />
                                <span className="truncate">
                                    {formatDate(order.createdAt)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                                <MapPin size={16} className="text-gray-400 flex-shrink-0 md:w-[18px] md:h-[18px]" />
                                <span className="truncate">
                                    {order.receiverAddress}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-left sm:text-right sm:ml-4 flex-shrink-0">
                        <div className="text-xs md:text-sm text-gray-500 mb-1 whitespace-nowrap">Tổng tiền</div>
                        <div className="text-black font-bold text-lg md:text-xl whitespace-nowrap">
                            {formatPrice(order.amount ?? 0)}đ
                        </div>
                    </div>
                </div>

                {/* Product preview & Actions - Responsive */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 bg-gray-50 rounded-xl p-3 md:p-4">
                    {/* Left - Product images and description */}
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        <div className="flex -space-x-2 md:-space-x-3 flex-shrink-0">
                            {order.responseOrderDetails.slice(0, 2).map((item, i) => (
                                <div
                                    key={i}
                                    className="w-12 h-12 md:w-14 md:h-14 rounded-lg border-2 border-white overflow-hidden bg-white shadow-sm relative"
                                >
                                    <img
                                        src={item.responseProductVariantDto.imageUrl}
                                        alt={item.responseProductVariantDto.variantName}
                                        className="w-full h-full object-cover"
                                    />

                                    {item.isReviewed && (
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                            <CheckCircle size={16} className="text-white md:w-5 md:h-5" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {productCount > 2 && (
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg border-2 border-white overflow-hidden bg-white shadow-sm relative">
                                    <img
                                        src={order.responseOrderDetails[2].responseProductVariantDto.imageUrl}
                                        alt={order.responseOrderDetails[2].responseProductVariantDto.variantName}
                                        className="w-full h-full object-cover opacity-50"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <span className="text-white font-bold text-xs md:text-sm">
                                            +{productCount - 2}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm md:text-base text-gray-800 mb-1 truncate">
                                {firstName}
                                {productCount > 1 && ` và ${productCount - 1} sản phẩm khác`}
                            </div>
                            <div className="text-xs md:text-sm text-gray-500">{productCount} sản phẩm</div>
                        </div>
                    </div>

                    {/* Right - Action buttons - Stack on mobile */}
                    <div className="flex flex-col sm:flex-row flex-shrink-0 gap-2 w-full md:w-auto">
                        <button
                            onClick={() => router.push(`/account/orders/${order.orderId}`)}
                            className="px-3 md:px-4 py-2 rounded-lg bg-black text-white text-xs md:text-sm font-medium hover:bg-gray-700 transition-all text-center"
                        >
                            Xem chi tiết
                        </button>

                        {(order.status === 'Pending' && order.paymentUrl) && (
                            <button
                                onClick={() => router.push(order.paymentUrl)}
                                className="px-3 md:px-4 py-2 rounded-lg border border-gray-300 text-xs md:text-sm font-medium hover:bg-gray-50 transition-all text-center"
                            >
                                Quay lại thanh toán
                            </button>
                        )}

                        {canReview && allReviewed && (
                            <button
                                onClick={handleOpenEditFlow}
                                className="px-3 md:px-4 py-2 rounded-lg bg-blue-100 text-blue-700 text-xs md:text-sm font-medium hover:bg-blue-200 transition-all text-center"
                            >
                                Xem đánh giá
                            </button>
                        )}
                    </div>
                </div>

                {/* Review section - Responsive */}
                {canReview && !allReviewed && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="flex-1">
                            <QuickRating
                                onRate={(rating) => handleOpenReviewFlow(rating)}
                            />
                        </div>
                        <div className="flex gap-2 sm:self-center">
                            <button
                                onClick={() => handleOpenReviewFlow(0)}
                                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-red-500 text-white text-xs md:text-sm font-medium hover:bg-red-600 transition-all text-center cursor-pointer"
                            >
                                Viết đánh giá
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <ProductReviewSelectionModal
                isOpen={selectionModalOpen}
                onClose={() => setSelectionModalOpen(false)}
                onSelectProduct={handleProductSelected}
                orderDetails={localOrderDetails}
                mode="review"
            />

            <ProductReviewSelectionModal
                isOpen={selectionEditModalOpen}
                onClose={() => setSelectionEditModalOpen(false)}
                onSelectProduct={handleProductSelectedForEdit}
                orderDetails={localOrderDetails}
                mode="edit"
            />

            {selectedDetail && (
                <RatingModal
                    isOpen={ratingModalOpen}
                    onClose={handleCloseRatingModal}
                    onSuccess={handleReviewSuccess}
                    productName={selectedDetail.responseProductVariantDto.variantName}
                    orderDetailId={selectedDetail.orderDetailId}
                    initialRating={initialRating}
                    isEditMode={selectedDetail.isReviewed}
                />
            )}
        </>
    );
}