'use client';
import { api } from "@/api/instance";
import FailStatus from "@/components/PaymentFail/FailStatus";
import PendingStatus from "@/components/PaymentPending/PendingStatus";
import SuccessStatus from "@/components/PaymentSuccess/SuccessStatus";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReturnPage() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'pending' | 'success' | 'fail'>('pending');

    const handleMomoReturn = async () => {
        try {
            const responseBE = await api.post("/payment/handle-payment");
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        const gateway = searchParams.get('gateway');
        if (!gateway) return;

        setStatus('pending');

        const verifyPayment = async () => {
            try {
                let verifyResult;

                if (gateway === 'momo') {
                    const resultCode = searchParams.get('resultCode');
                    handleMomoReturn();
                    if (resultCode === '0') setStatus('success');
                    else setStatus('fail');
                }

                else if (gateway === 'vnpay') {
                    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
                    const vnp_TxnRef = searchParams.get('vnp_TxnRef');

                    if (vnp_ResponseCode === '00') setStatus('success');
                    else setStatus('fail');
                }
            } catch (error) {
                setStatus('fail');
            }
        };

        verifyPayment();
    }, [searchParams]);

    if (status === 'pending') return <PendingStatus />;
    if (status === 'success') return <SuccessStatus />;
    if (status === 'fail') return <FailStatus />;
}