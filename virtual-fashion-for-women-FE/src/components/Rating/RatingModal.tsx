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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative">
                 <button
                     onClick={onClose}
                     className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                 >
                     <X size={24} />
                 </button>

                 <h2 className="text-xl font-semibold mb-2">
                     {isEditMode ? 'Xem/Sửa đánh giá' : 'Viết đánh giá'}
                 </h2>
                 <p className="text-gray-600 mb-4 truncate">
                     Sản phẩm: <strong>{productName}</strong>
                 </p>
                 
                 {/* FIX 1: Điều chỉnh logic loading 
                   Chỉ loading khi (isEditMode VÀ chưa fetch xong currentRatingId)
                 */}
                 {loading && isEditMode && !currentRatingId ? (
                      <div className="h-[200px] flex items-center justify-center">
                          <p className="text-gray-500">Đang tải đánh giá của bạn...</p>
                      </div>
                 ) : (
                      <>
                          <div className="flex justify-center items-center gap-2 my-4">
                              {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                      key={star}
                                      size={36}
                                      className={`cursor-pointer transition-all ${
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

                          <textarea
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              rows={4}
                              maxLength={300}
                              placeholder="Chia sẻ suy nghĩ của bạn về sản phẩm này..."
                              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/20"
                          />
                          <div className="text-right text-sm text-gray-400 mt-1">
                              {comment.length}/300
                          </div>

                          <button
                              onClick={handleSubmit}
                              disabled={loading}
                              className="w-full bg-red-500 text-white font-semibold py-3 rounded-lg mt-4 hover:bg-red-600 transition-all disabled:opacity-50"
                          >
                              {loading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Gửi đánh giá')}
                          </button>
                      </>
                 )}
             </div>
         </div>
    );
}