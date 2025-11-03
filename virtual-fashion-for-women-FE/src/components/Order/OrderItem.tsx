'use client';

import { Calendar, CheckCircle, Clock, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { OrderDTO } from '@/models/OrderDTO';
import formatPrice from '@/utils/formatPrice';
import statusMap from '@/helpers/statusMapper';
import { AntButtonCommon } from '../AntDesign/Button/AntButtonCommon';
import formatDate from '@/utils/formatDate';

import { useEffect, useState } from 'react';
import QuickRating from '@/components/Rating/QuickRating';
import RatingModal from '@/components/Rating/RatingModal';
// Import modal mới
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

    // 1. State cho modal chọn sản phẩm (khi có > 1 sp)
    const [selectionModalOpen, setSelectionModalOpen] = useState(false);
    // 2. Modal chọn sp để XEM/SỬA
    const [selectionEditModalOpen, setSelectionEditModalOpen] = useState(false);

    // 3. State cho modal viết đánh giá (modal cuối)
    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    
    // 4. State lưu chi tiết sản phẩm đang được chọn để đánh giá
    const [selectedDetail, setSelectedDetail] = useState<OrderDetailDTO | null>(null);
    
    // 5. State lưu số sao ban đầu (từ "Đánh giá nhanh")
    const [initialRating, setInitialRating] = useState(0);

    // 6. State theo dõi xem *toàn bộ* đơn hàng đã được review hết chưa
    const [allReviewed, setAllReviewed] = useState(false);

    // 7. State lưu trữ chi tiết đơn hàng (để cập nhật UI khi review xong)
    const [localOrderDetails, setLocalOrderDetails] = useState(order.responseOrderDetails);

    // Cập nhật trạng thái `allReviewed` mỗi khi `localOrderDetails` thay đổi
    useEffect(() => {
        const checkAllReviewed = localOrderDetails.every(detail => detail.isReviewed);
        setAllReviewed(checkAllReviewed);
    }, [localOrderDetails]);


    // Hàm này được gọi khi bấm "Đánh giá nhanh" hoặc "Viết đánh giá"
    const handleOpenReviewFlow = (rating: number) => {
        setInitialRating(rating); // Lưu số sao (0 nếu bấm "Viết đánh giá")
        
        // Tìm các sản phẩm chưa được đánh giá
        const unreviewedDetails = localOrderDetails.filter(d => !d.isReviewed);

        if (unreviewedDetails.length === 0) {
            // Trường hợp không còn gì để review (lý thuyết sẽ không xảy ra vì nút bị ẩn)
            setAllReviewed(true);
            return;
        }

        if (unreviewedDetails.length === 1) {
            // Chỉ có 1 sản phẩm (hoặc còn 1 sp chưa review) -> Mở thẳng modal đánh giá
            setSelectedDetail(unreviewedDetails[0]);
            setRatingModalOpen(true);
        } else {
            // Có nhiều hơn 1 sản phẩm chưa review -> Mở modal chọn lựa
            setSelectionModalOpen(true);
        }
    };

    // Hàm này được gọi từ modal chọn lựa sản phẩm
    const handleProductSelected = (detail: OrderDetailDTO) => {
        setSelectedDetail(detail);
        setSelectionModalOpen(false); // Đóng modal chọn
        setRatingModalOpen(true);      // Mở modal đánh giá
    };

    const handleOpenEditFlow = () => {
        // Mở modal chọn sản phẩm, nhưng ở chế độ "edit"
        setSelectionEditModalOpen(true);
    };

    const handleProductSelectedForEdit = (detail: OrderDetailDTO) => {
        setInitialRating(0); // Không cần sao ban đầu khi sửa
        setSelectedDetail(detail);
        setSelectionEditModalOpen(false);
        setRatingModalOpen(true);
    };

    const handleReviewSuccess = () => {
        setRatingModalOpen(false);

        // Cập nhật trạng thái `isReviewed` của sản phẩm vừa đánh giá
        if (selectedDetail && !selectedDetail.isReviewed) {
            setLocalOrderDetails(prevDetails =>
                prevDetails.map(d =>
                    d.orderDetailId === selectedDetail.orderDetailId
                        ? { ...d, isReviewed: true }
                        : d
                )
            );
        }
        
        setSelectedDetail(null); // Quan trọng: reset selected detail
    };

    const handleCloseRatingModal = () => {
        setRatingModalOpen(false);
        setSelectedDetail(null); // Quan trọng: reset selected detail
    };

    // Điều kiện hiển thị phần đánh giá
    const canReview = (/*order.status === 'Delivered' ||*/ order.status === 'Completed');

    return (
        <>
            <div className="w-full bg-white rounded-2xl shadow-sm border p-6 mb-4 hover:shadow-md transition-all">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="font-bold text-lg">
                                ORD-{order.orderId}
                            </span>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-6 h-6 flex items-center justify-center rounded-full"
                                    style={{ backgroundColor: statusInfo.bg }}
                                >
                                    <StatusIcon size={16} color={statusInfo.color} />
                                </div>
                                <span
                                    className="text-sm font-medium"
                                    style={{ color: statusInfo.color }}
                                >
                                    {statusInfo.label}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Calendar size={18} className="text-gray-400" />
                                <span>
                                    {formatDate(order.createdAt)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={18} className="text-gray-400" />
                                <span className="truncate max-w-xs sm:max-w-sm">
                                    {order.receiverAddress}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-right ml-4 flex-shrink-0">
                        <div className="text-sm text-gray-500 mb-1 whitespace-nowrap">Tổng tiền</div>
                        <div className="text-black font-bold text-xl whitespace-nowrap">
                            {formatPrice(order.amount ?? 0)}đ
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4 bg-gray-50 rounded-xl p-4">
                    {/* Left - Hình ảnh và mô tả sản phẩm */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex -space-x-3">
                            {order.responseOrderDetails.slice(0, 2).map((item, i) => (
                                <div
                                    key={i}
                                    className="w-14 h-14 rounded-lg border-2 border-white overflow-hidden bg-white shadow-sm relative"
                                >
                                    <img
                                        src={item.responseProductVariantDto.imageUrl}
                                        alt={item.responseProductVariantDto.variantName}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Thêm check đã review */}
                                        {item.isReviewed && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <CheckCircle size={20} className="text-white" />
                                            </div>
                                        )}
                                </div>
                            ))}

                            {productCount > 2 && (
                                <div className="w-14 h-14 rounded-lg border-2 border-white overflow-hidden bg-white shadow-sm relative">
                                    <img
                                        src={order.responseOrderDetails[2].responseProductVariantDto.imageUrl}
                                        alt={order.responseOrderDetails[2].responseProductVariantDto.variantName}
                                        className="w-full h-full object-cover opacity-50"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">
                                            +{productCount - 2}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-800 mb-1 truncate">
                                {firstName}
                                {productCount > 1 && ` và ${productCount - 1} sản phẩm khác`}
                            </div>
                            <div className="text-sm text-gray-500">{productCount} sản phẩm</div>
                        </div>
                    </div>

                    {/* Right - Nút bấm */}
                    <div className="flex flex-shrink-0 gap-2">
                        <button
                            onClick={() => router.push(`/account/orders/${order.orderId}`)}
                            className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-700 transition-all"
                        >
                            Xem chi tiết
                        </button>

                        {
                            (order.status === 'Pending' && order.paymentUrl) && (
                                <button
                                    onClick={() => router.push(order.paymentUrl)}
                                    className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-all"
                                >
                                    Quay lại thanh toán
                                </button>
                            )
                        }

                        {(order.status === 'Delivered' || order.status === 'Completed') && (
                            <button
                                onClick={() => console.log('Mua lại', order.orderId)}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-all"
                            >
                                Mua lại
                            </button>
                        )}

                        {/* Thay "Đã đánh giá" bằng nút "Xem đánh giá" */}
                        {canReview && allReviewed && (
                             <button
                                onClick={handleOpenEditFlow}
                                className="px-4 py-2 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition-all"
                             >
                                Xem đánh giá
                             </button>
                        )}
                    </div>
                </div>

                {/* === PHẦN ĐÁNH GIÁ MỚI === */}
                {/* Chỉ hiển thị khi có thể review VÀ chưa review HẾT */}
                {canReview && !allReviewed && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4">
                        <QuickRating 
                            onRate={(rating) => handleOpenReviewFlow(rating)} 
                        />
                        <div className="flex gap-2 self-end sm:self-center">
                            <button
                                onClick={() => handleOpenReviewFlow(0)} // 0 = không chọn sao ban đầu
                                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all"
                            >
                                Viết đánh giá
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {/* Modal Chọn sản phẩm (ĐÁNH GIÁ MỚI) */}
            <ProductReviewSelectionModal
                isOpen={selectionModalOpen}
                onClose={() => setSelectionModalOpen(false)}
                onSelectProduct={handleProductSelected}
                orderDetails={localOrderDetails} 
                mode="review" // Chế độ đánh giá mới
            />

            {/* Modal Chọn sản phẩm (XEM/SỬA) */}
            <ProductReviewSelectionModal
                isOpen={selectionEditModalOpen}
                onClose={() => setSelectionEditModalOpen(false)}
                onSelectProduct={handleProductSelectedForEdit}
                orderDetails={localOrderDetails}
                mode="edit" // Chế độ xem/sửa
            />

            {/* Modal Đánh giá (chung cho cả 2) */}
            {selectedDetail && (
                <RatingModal
                    isOpen={ratingModalOpen}
                    onClose={handleCloseRatingModal}
                    onSuccess={handleReviewSuccess}
                    productName={selectedDetail.responseProductVariantDto.variantName}
                    orderDetailId={selectedDetail.orderDetailId}
                    initialRating={initialRating}
                    // Báo cho modal biết đây là chế độ Sửa
                    isEditMode={selectedDetail.isReviewed} 
                />
            )}
        </>
        
    );
}
