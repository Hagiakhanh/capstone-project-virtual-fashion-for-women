'use client';

import { Loader2 } from 'lucide-react';

export default function PendingStatus() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-yellow-50 to-white px-4 text-center">
            {/* Biểu tượng loading */}
            <div className="relative mb-6">
                <Loader2 className="w-20 h-20 text-yellow-500 animate-spin drop-shadow-lg" />
                <div className="absolute inset-0 animate-ping rounded-full bg-yellow-300 opacity-20" />
            </div>

            {/* Tiêu đề */}
            <h2 className="text-3xl font-bold mb-3 text-yellow-600">
                Đang xử lý thanh toán
            </h2>

            {/* Mô tả */}
            <p className="text-gray-600 max-w-md mb-6">
                Hệ thống đang xác nhận giao dịch của bạn. Vui lòng không rời khỏi trang này cho đến khi quá trình hoàn tất.
            </p>

            {/* Thanh tiến trình giả */}
            <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 animate-[progress_2s_ease-in-out_infinite]" />
            </div>

            {/* Custom animation */}
            <style jsx>{`
                @keyframes progress {
                    0% {
                        transform: translateX(-100%);
                    }
                    50% {
                        transform: translateX(0%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
            `}</style>
        </div>
    );
}
