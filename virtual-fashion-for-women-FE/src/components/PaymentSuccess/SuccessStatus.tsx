'use client';

import { CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SuccessStatus() {
    const router = useRouter();
    const [showRedirect, setShowRedirect] = useState(false);

    useEffect(() => {
        // Hiệu ứng loading nhẹ trước khi redirect
        const timeout = setTimeout(() => setShowRedirect(true), 2000);
        const redirect = setTimeout(() => router.push('/'), 4000);

        return () => {
            clearTimeout(timeout);
            clearTimeout(redirect);
        };
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-white px-4 text-center">
            {/* Icon */}
            <div className="relative mb-6">
                <CheckCircle className="w-20 h-20 text-green-500 drop-shadow-lg animate-bounce" />
                <div className="absolute inset-0 animate-ping rounded-full bg-green-300 opacity-20" />
            </div>

            {/* Tiêu đề */}
            <h2 className="text-3xl font-bold mb-3 text-green-600">
                Thanh toán thành công!
            </h2>

            {/* Mô tả */}
            <p className="text-gray-600 max-w-md mb-6">
                Giao dịch của bạn đã được xử lý thành công. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi 💚
            </p>

            {/* Loading effect trước khi redirect */}
            {showRedirect && (
                <div className="flex items-center gap-2 text-gray-500 text-sm animate-pulse">
                    <span>Đang chuyển hướng về trang chủ</span>
                    <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                    <span className="inline-block w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                </div>
            )}
        </div>
    );
}
