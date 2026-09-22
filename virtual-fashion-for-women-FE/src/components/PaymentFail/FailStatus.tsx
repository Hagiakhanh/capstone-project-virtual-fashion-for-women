'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, Loader2 } from 'lucide-react';

export default function FailStatus() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Đếm ngược mỗi giây
        const interval = setInterval(() => {
            setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        // Sau 5 giây: fade-out → chờ hiệu ứng → redirect
        const timeout = setTimeout(() => {
            setFadeOut(true);
            setIsRedirecting(true);
            setTimeout(() => {
                router.push('/');
            }, 800); // thời gian hiệu ứng fade-out
        }, 5000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [router]);

    return (
        <div
            className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-red-50 to-white px-4 text-center transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'
                }`}
        >
            {/* Icon */}
            <div className="relative mb-6">
                <XCircle className="w-24 h-24 text-red-500 animate-pulse drop-shadow-lg" />
                <div className="absolute inset-0 animate-ping rounded-full bg-red-300 opacity-20" />
            </div>

            {/* Tiêu đề */}
            <h1 className="text-3xl font-bold text-red-600 mb-3">
                Thanh toán thất bại
            </h1>

            {/* Mô tả */}
            <p className="text-gray-600 max-w-md mb-6">
                Giao dịch không thành công. Vui lòng thử lại hoặc quay về trang chủ.
            </p>

            {/* Nút hành động */}
            <button
                onClick={() => {
                    setFadeOut(true);
                    setIsRedirecting(true);
                    setTimeout(() => router.push('/'), 800);
                }}
                disabled={isRedirecting}
                className={`flex items-center gap-2 bg-red-500 text-white px-6 py-2.5 rounded-lg transition-all shadow-md hover:bg-red-600 hover:shadow-lg disabled:opacity-70`}
            >
                {isRedirecting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Đang chuyển hướng...
                    </>
                ) : (
                    'Quay về trang chủ'
                )}
            </button>

            {/* Đếm ngược */}
            {!isRedirecting && (
                <p className="text-sm text-gray-500 mt-4">
                    Bạn sẽ được chuyển về sau{' '}
                    <span className="font-semibold text-red-600">{countdown}</span> giây...
                </p>
            )}
        </div>
    );
}
