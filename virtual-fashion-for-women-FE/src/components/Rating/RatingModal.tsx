'use client';

import { api } from '@/api/instance';
import { messageToast } from '@/helpers/toastHelper';
import { Star, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; 
    productName: string;
    orderDetailId: number;
    initialRating?: number;
    isEditMode: boolean; // Prop mới
}

export default function RatingModal({
    isOpen,
    onClose,
    onSuccess,
    productName,
    orderDetailId,
    initialRating = 0,
    isEditMode = false // Mặc định là false
}: RatingModalProps) {
    const [rating, setRating] = useState(initialRating);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    // Dùng để so sánh xem người dùng có thay đổi gì không
    const [fetchedRating, setFetchedRating] = useState(0);
    const [fetchedComment, setFetchedComment] = useState('');
    
    // === FIX 1: Thêm state để lưu ratingId thực sự khi edit ===
    const [currentRatingId, setCurrentRatingId] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Reset
            setLoading(true);
            setHoverRating(0);
            
            // Reset ID
            setCurrentRatingId(null); 

            if (isEditMode) {
                // === CHẾ ĐỘ EDIT: Fetch đánh giá cũ ===
                const fetchReview = async () => {
                    try {
                        const response = await api.get(`/rating/customer-rating/${orderDetailId}`);
                        if (response.status === 200 && response.data) {
                            
                            // === FIX 1: Lưu lại cả ratingId ===
                            const { ratingId, ratingValue, comment } = response.data;
                            
                            setRating(ratingValue);
                            setComment(comment);
                            setCurrentRatingId(ratingId); // <-- LƯU ID

                            // Lưu lại giá trị gốc
                            setFetchedRating(ratingValue);
                            setFetchedComment(comment || '');
                        } else {
                            messageToast.error("Không tải được đánh giá.");
                            onClose();
                        }
                    } catch (error: any) {
                        messageToast.error(error);
                        onClose();
                    } finally {
                        setLoading(false);
                    }
                };
                fetchReview();
            } else {
                // === CHẾ ĐỘ CREATE: Reset state ===
                setRating(initialRating); // Lấy sao từ "Đánh giá nhanh"
                setComment('');
                setFetchedRating(0);
                setFetchedComment('');
                setLoading(false);
            }
        }
    // Thêm onClose vào dependencies
    }, [isOpen, isEditMode, orderDetailId, initialRating, onClose]); 

    const handleSubmit = async () => {
        if (rating === 0) {
            messageToast.error('Vui lòng chọn số sao đánh giá.');
            return;
        }

        if (isEditMode && rating === fetchedRating && comment === fetchedComment) {
            messageToast.info("Bạn chưa thay đổi nội dung đánh giá.");
            return;
        }

        // === FIX 1: Kiểm tra xem đã có ratingId chưa (cho chế độ edit) ===
        if (isEditMode && !currentRatingId) {
            messageToast.error("Lỗi: Không tìm thấy ID đánh giá để cập nhật.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                RatingValue: rating,
                Comment: comment,
                OrderDetailId: orderDetailId // Vẫn gửi OrderDetailId, DTO của C# có thể cần nó
            };
            
            let response;
            if (isEditMode) {
                // === FIX 1: Dùng currentRatingId thay vì orderDetailId ===
                response = await api.put(`/rating/${currentRatingId}`, payload);
            } else {
                // === CHẾ ĐỘ CREATE: Gọi API POST ===
                response = await api.post('/rating', payload);
            }

            if (response.status === 200 || response.status === 201) {
                messageToast.success(isEditMode ? "Cập nhật đánh giá thành công!" : "Gửi đánh giá thành công!");
                onSuccess(); // Gọi callback thành công
            } else {
                messageToast.error(response.data.message || 'Thao tác thất bại.');
            }
        } catch (error: any) {
            // Lỗi từ axios (bao gồm lỗi 500 từ route handler)
            messageToast.error(error.response?.data?.message || error.message || "Lỗi không xác định");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // ...Phần JSX giữ nguyên...
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-xl relative max-h-[90vh] overflow-y-auto">
                {/* Nút đóng */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors z-10"
                    aria-label="Đóng"
                >
                    <X size={20} className="sm:w-6 sm:h-6" />
                </button>

                {/* Tiêu đề */}
                <h2 className="text-lg sm:text-xl font-semibold mb-2 pr-8">
                    {isEditMode ? 'Xem/Sửa đánh giá' : 'Viết đánh giá'}
                </h2>
                
                {/* Tên sản phẩm */}
                <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2 pr-6">
                    Sản phẩm: <strong className="text-gray-800">{productName}</strong>
                </p>
                
                {loading && isEditMode && !currentRatingId ? (
                    <div className="h-[150px] sm:h-[200px] flex items-center justify-center">
                        <p className="text-sm sm:text-base text-gray-500">Đang tải đánh giá của bạn...</p>
                    </div>
                ) : (
                    <>
                        {/* Sao đánh giá */}
                        <div className="flex justify-center items-center gap-1.5 sm:gap-2 my-4 sm:my-5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={32}
                                    className={`cursor-pointer transition-all touch-manipulation active:scale-125 sm:w-9 sm:h-9 ${
                                        (hoverRating || rating) >= star
                                            ? 'text-yellow-400 fill-yellow-400'
                                            : 'text-gray-300'
                                    }`}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>

                        {/* Label đánh giá (mobile) */}
                        <div className="text-center mb-3 sm:mb-4">
                            <span className="text-sm sm:text-base font-medium text-gray-700">
                                {rating > 0 && (
                                    <>
                                        {rating === 1 && 'Rất tệ'}
                                        {rating === 2 && 'Tệ'}
                                        {rating === 3 && 'Ổn'}
                                        {rating === 4 && 'Tốt'}
                                        {rating === 5 && 'Rất tốt'}
                                    </>
                                )}
                            </span>
                        </div>

                        {/* Textarea */}
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            maxLength={300}
                            placeholder="Chia sẻ suy nghĩ của bạn về sản phẩm này..."
                            className="w-full p-3 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20 resize-none"
                        />
                        
                        {/* Đếm ký tự */}
                        <div className="text-right text-xs sm:text-sm text-gray-400 mt-1 mb-3">
                            {comment.length}/300
                        </div>

                        {/* Nút submit */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-red-500 text-white font-semibold py-2.5 sm:py-3 rounded-lg text-sm sm:text-base hover:bg-red-600 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                        >
                            {loading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Gửi đánh giá')}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}