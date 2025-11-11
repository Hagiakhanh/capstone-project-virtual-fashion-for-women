'use client';
import Lottie from "lottie-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import bgConfirm from '@/assets/auth/bg-confirm.jpg';
import loading from '@/assets/lottie/SandyLoading.json'
import { typeConfirmEmail } from "@/types/auth";
import { api } from "@/api/instance";
import { messageToast } from "@/helpers/toastHelper";

export default function ConfirmEmailPage() {
   const searchParams = useSearchParams();
   const router = useRouter();

   useEffect(() => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');
      if (!token || !email) {
         // Thông báo lỗi

         return;
      }
      const handleConfirmEmail = async () => {
         try {
            const payload: typeConfirmEmail = {
               email: email,
               confirmToken: token
            }
            const response = await api.post('/confirm-email', payload);
            if (response.status === 200) {
               // Thông báo xác nhận thành công
               messageToast.success("Xác nhận email thành công! Vui lòng đăng nhập.");
               router.replace("/login");
            } else {
               // Thông báo lỗi
               messageToast.error("Xác nhận email thất bại! Vui lòng thử lại.");
               router.replace('/')
            }
         } catch (error) {
            // Thông báo lỗi
            messageToast.error("Xác nhận email thất bại! Vui lòng thử lại.");
            router.replace('/')
         }
      }
      handleConfirmEmail();

   }, [searchParams])

   return (
      <div className='w-[100vw] h-[100vh] flex justify-center items-center bg-cover bg-center'
         style={{
            backgroundImage: `url(${bgConfirm.src})`
         }}
      >
         <div className="absolute inset-0 bg-amber-50/50"></div>

         <div className='text-center relative z-10'>
            <div className="w-40 h-40 mx-auto mb-3">
               <Lottie animationData={loading} loop={true} />
            </div>
            <h1 className='font-bold text-6xl mb-6'>
               Đang xác minh tài khoản của bạn...
            </h1>
            <p className='font-normal text-2xl'>
               Vui lòng chờ trong giây lát.
            </p>
         </div>
      </div>
   )
}