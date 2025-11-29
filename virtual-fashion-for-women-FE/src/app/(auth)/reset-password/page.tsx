'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button } from 'antd';
import { CloseOutlined, ArrowLeftOutlined, LockOutlined } from '@ant-design/icons';
import bgLogin from '../../../assets/auth/bg-login.png'; // Đường dẫn ảnh nền của bạn
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/api/instance';
import { messageToast } from '@/helpers/toastHelper';

export default function ResetNewPasswordPage() {
   const [loading, setLoading] = useState(false);
   const router = useRouter();
   const searchParams = useSearchParams();

   const token = searchParams.get('token');
   const email = searchParams.get('email');

   // Nếu không có token hoặc email thì đá về trang chủ hoặc báo lỗi
   useEffect(() => {
      if (!token || !email) {
         messageToast.error("Đường dẫn không hợp lệ hoặc đã hết hạn!");
         router.push("/login");
      }
   }, [token, email, router]);

   const onFinish = async (values: any) => {
      setLoading(true);
      try {
         const payload = {
            password: values.password,
            confirmPassword: values.confirmPassword,
            resetToken: token,
            email: email
         };

         const response = await api.post('/create-new-password', payload); // Đổi endpoint cho đúng BE của bạn

         if (response.status === 200) {
            messageToast.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
            router.replace("/login");
         }
      } catch (error) {
         console.error("Reset password error:", error);
         messageToast.error("Có lỗi xảy ra. Vui lòng thử lại hoặc yêu cầu link mới.");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="relative flex min-h-screen items-center justify-center bg-cover bg-center" style={{ backgroundImage: `url(${bgLogin.src})` }}>

         {/* Overlay làm tối nền một chút để nổi bật form */}
         <div className="absolute inset-0 bg-black/10 z-0"></div>

         <div className="relative z-10 w-full max-w-[500px] rounded-xl bg-white p-10 shadow-2xl animate-fade-in-up mx-4">

            {/* Nút đóng */}
            <button
               className="absolute right-5 top-5 text-gray-400 hover:text-gray-600 transition-colors"
               onClick={() => router.push("/login")}
            >
               <CloseOutlined style={{ fontSize: '20px' }} />
            </button>

            {/* Tiêu đề */}
            <div className="mb-6 text-center">
               <h2 className="text-3xl font-bold text-gray-900 mb-2">Đặt lại mật khẩu</h2>
               <p className="text-gray-500 text-sm px-4">
                  Vui lòng nhập mật khẩu mới cho tài khoản <br />
                  <span className="font-semibold text-gray-700">{email}</span>
               </p>
            </div>

            {/* Form */}
            <Form
               name="reset_new_password"
               layout="vertical"
               onFinish={onFinish}
               autoComplete="off"
               size="large"
            >
               {/* Mật khẩu mới */}
               <Form.Item
                  label={<span className="text-xl font-bold">Mật khẩu mới</span>}
                  name="password"
                  rules={[
                     { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                     { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                  ]}
               >
                  <Input.Password
                     size="large"
                     style={{ fontSize: "1rem", padding: "10px" }}
                     placeholder="Nhập mật khẩu mới"
                     disabled={loading}
                  />
               </Form.Item>

               {/* Xác nhận mật khẩu */}
               <Form.Item
                  label={<span className="text-xl font-bold">Xác nhận mật khẩu</span>}
                  name="confirmPassword"
                  dependencies={['password']} // Phụ thuộc vào field password để so sánh
                  rules={[
                     { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                     ({ getFieldValue }) => ({
                        validator(_, value) {
                           if (!value || getFieldValue('password') === value) {
                              return Promise.resolve();
                           }
                           return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                        },
                     }),
                  ]}
               >
                  <Input.Password
                     size="large"
                     style={{ fontSize: "1rem", padding: "10px" }}
                     placeholder="Nhập lại mật khẩu mới"
                     disabled={loading}
                  />
               </Form.Item>

               {/* Nút Submit */}
               <Form.Item className="mt-8 mb-4">
                  <div>
                     <Button style={{ fontSize: '1.25rem', fontWeight: 'bold', backgroundColor: '#FAE3B6' }} className="mt-5 w-full !py-6 !text-black !hover:text-black" shape="round" size="large"
                        htmlType="submit"
                        loading={loading}
                        disabled={loading}
                     >
                        {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                     </Button>
                  </div>
               </Form.Item>
            </Form>

            {/* Footer Link */}
            <div className="mt-4 border-t border-gray-100 pt-6 text-center">
               <a
                  href="/login"
                  className={`inline-flex items-center text-sm font-medium text-gray-600 hover:text-black hover:underline transition-all ${loading ? 'pointer-events-none opacity-50' : ''}`}
               >
                  <ArrowLeftOutlined className="mr-2" /> Quay lại đăng nhập
               </a>
            </div>
         </div>
      </div>
   );
}