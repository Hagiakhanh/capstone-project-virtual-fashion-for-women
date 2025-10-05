'use client';
import FailStatus from "@/components/PaymentFail/FailStatus";
import PendingStatus from "@/components/PaymentPending/PendingStatus";
import SuccessStatus from "@/components/PaymentSuccess/SuccessStatus";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReturnPage() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'pending' | 'success' | 'fail'>('pending');

    useEffect(() => {
        const gateway = searchParams.get('gateway');
        if (!gateway) return;

        // 🚀 Hiển thị pending trong lúc xác nhận
        setStatus('pending');

        // ✅ Tách riêng logic từng cổng
        const verifyPayment = async () => {
            try {
                let verifyResult;

                if (gateway === 'momo') {
                    const resultCode = searchParams.get('resultCode');

                    // Nếu chỉ test FE:
                    if (resultCode === '0') setStatus('success');
                    else setStatus('fail');
                }

                else if (gateway === 'vnpay') {
                    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
                    const vnp_TxnRef = searchParams.get('vnp_TxnRef');

                    // Nếu chỉ test FE:
                    if (vnp_ResponseCode === '00') setStatus('success');
                    else setStatus('fail');
                }

                // // (Tùy chọn) BE verify thật
                // if (verifyResult?.data?.status === 'SUCCESS') {
                //     setStatus('success');
                // } else if (verifyResult?.data?.status === 'FAILED') {
                //     setStatus('fail');
                // }
            } catch (error) {
                setStatus('fail');
            }
        };

        verifyPayment();
    }, [searchParams]);

    // ✅ Hiển thị component tương ứng
    if (status === 'pending') return <PendingStatus />;
    if (status === 'success') return <SuccessStatus />;
    if (status === 'fail') return <FailStatus />;
}