'use client';

import React, { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { CloseOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import bgLogin from '../../../assets/auth/bg-login.png'
import { useRouter } from 'next/navigation';
import { api } from '@/api/instance';
import { messageToast } from '@/helpers/toastHelper';

export default function ResetPasswordPage() {
   const [loading, setLoading] = useState(false);
   const router = useRouter();

   // Xử lý khi người dùng nhấn Gửi
   const onFinish = async (values: any) => {
      setLoading(true);

      try {
         const response = await api.post('/forgot-password', values);
         if (response.status === 200) {
            messageToast.success("Yêu cầu quên mật khẩu thành công! Vui lòng kiểm tra email của bạn.");
            router.replace("/login");
         }

      } catch (error) {
         console.error("Forgot password error:", error);
         messageToast.error("Yêu cầu quên mật khẩu thất bại. Vui lòng thử lại.");
      } finally {
         setLoading(false);
      }

   };

   return (
      <div className="relative flex min-h-screen items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${bgLogin.src})` }}>

         <div className="relative z-10 w-full max-w-[500px] rounded-xl bg-white p-10 shadow-2xl animate-fade-in-up mx-4">

            {/* Nút đóng (Close Button) */}
            <button
               className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 transition-colors"
               onClick={() => { router.push("/") }}
            >
               <CloseOutlined style={{ fontSize: '20px' }} />
            </button>

            {/* Tiêu đề */}
            <div className="mb-8 text-center">
               <h2 className="text-3xl font-bold text-gray-900 mb-2">Quên mật khẩu?</h2>
               <p className="text-gray-500 text-sm px-4">
                  Đừng lo lắng! Hãy nhập email bạn đã đăng ký, chúng tôi sẽ gửi mã xác nhận để bạn đặt lại mật khẩu.
               </p>
            </div>

            {/* Form Ant Design */}
            <Form
               name="forgot_password"
               layout="vertical"
               onFinish={onFinish}
               autoComplete="off"
               size="large"
            >
               {/* Input Email */}
               <Form.Item
                  label={<span className="text-xl font-bold">Email</span>}
                  name="email"
                  rules={[
                     { required: true, message: 'Vui lòng nhập email' },
                     { type: 'email', message: 'Email không hợp lệ' },
                  ]}
               >
                  <Input
                     id="email"
                     size="middle"
                     style={{ fontSize: "1.25rem" }}
                     placeholder="Nhập địa chỉ email của bạn"
                  />
               </Form.Item>

               {/* Nút Submit */}
               <Form.Item className="mt-6 mb-4">
                  <div>
                     <Button style={{ fontSize: '1.25rem', fontWeight: 'bold', backgroundColor: '#FAE3B6' }} className="mt-5 w-full !py-6 !text-black !hover:text-black" shape="round" size="large"
                        htmlType="submit"
                        loading={loading}
                        disabled={loading}
                     >
                        Gửi mã
                     </Button>
                  </div>
               </Form.Item>
            </Form>

            {/* Footer Link */}
            <div className="mt-4 border-t border-gray-100 pt-6 text-center">
               {/* Giả sử bạn dùng React Router Link, nếu không thì dùng thẻ a */}
               <a
                  href="/login"
                  className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-black hover:underline transition-all"
               >
                  <ArrowLeftOutlined className="mr-2" /> Quay lại đăng nhập
               </a>
            </div>
         </div>
      </div>
   );
}