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
      <div className='w-screen h-screen flex justify-center items-center bg-cover bg-center px-4'
         style={{
            backgroundImage: `url(${bgConfirm.src})`
         }}
      >
         <div className="absolute inset-0 bg-amber-50/50"></div>

         <div className='text-center relative z-10 max-w-2xl mx-auto'>
            <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 mx-auto mb-3 md:mb-4 lg:mb-6">
               <Lottie animationData={loading} loop={true} />
            </div>
            <h1 className='font-bold text-2xl md:text-4xl lg:text-5xl xl:text-6xl mb-3 md:mb-4 lg:mb-6 leading-tight px-4'>
               Đang xác minh tài khoản của bạn...
            </h1>
            <p className='font-normal text-base md:text-xl lg:text-2xl px-4'>
               Vui lòng chờ trong giây lát.
            </p>
         </div>
      </div>
   )
}