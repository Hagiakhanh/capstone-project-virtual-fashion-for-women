"use client";
import { CloseOutlined } from '@ant-design/icons';
import { Input, Form } from "antd";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { Button } from "antd";

import bgRegister from '../../../assets/auth/bg-login.png'
import googleIcon from '../../../assets/auth/GoogleIcon.webp'
import { typeRegister } from '@/types/auth';
import { api } from '@/api/instance';
import { useState } from 'react';
import { messageToast } from '@/helpers/toastHelper';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
   const router = useRouter();
   const [form] = Form.useForm();
   const [loading, setLoading] = useState<boolean>(false);
   const { loginSuccess } = useAuth();

   const handleRegister = async (values: typeRegister) => {
      setLoading(true);
      try {
         const response = await api.post('/register', values);
         if (response.status === 200) {
            router.replace("/login");
            //Thông báo vào mail để xác nhận tài khoản
            messageToast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.");
         }
      } catch (error) {
         console.error("Register error:", error);
         messageToast.error("Đăng ký thất bại! Vui lòng thử lại.");
         setLoading(false);
      }
   }

   const handleLoginWithGoogle = async (credential: any) => {
      try {
         const payload = { credential: credential };
         const response = await api.post('/login/google', payload);
         if (response.status === 200) {
            loginSuccess(response.data.user);
            messageToast.success("Đăng nhập thành công!");
            if (response.data.user.role === 'admin') {
               router.replace("/admin");
            } else if (response.data.user.role === 'staff') {
               router.replace("/staff");
            } else if (response.data.user.role === 'customer') {
               router.replace("/");
            }
         } else {

         }
      } catch (error) {
         console.error("Login with Google error:", error);
      }
   }

   return (
      <div className="w-[100vw] min-h-[100vh] flex justify-center items-center bg-cover bg-center p-4"
         style={{ backgroundImage: `url(${bgRegister.src})` }}
      >
         <div className="bg-[white] w-full sm:w-[90%] md:w-[70%] lg:w-[50%] rounded-2xl flex flex-col items-center py-8 sm:py-12 md:py-16 lg:py-20 px-4 relative my-4">
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 cursor-pointer z-10"
               onClick={() => { router.push("/") }}
            >
               <CloseOutlined style={{ fontSize: '1.25rem', color: '#888' }} className="sm:text-2xl" />
            </div>
            
            <div className="w-full sm:w-[85%] md:w-[75%] lg:w-[60%] mx-auto flex flex-col">
               <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center">
                  Đăng ký
               </h1>
               
               <p className="mt-3 sm:mt-4 font-normal text-base sm:text-lg md:text-xl text-center">
                  Bạn đã có tài khoản? <Link href="/login" className="cursor-pointer underline">Đăng nhập ngay</Link>
               </p>
               
               <Form<typeRegister>
                  form={form}
                  layout="vertical"
                  onFinish={handleRegister}
                  className="mt-2 sm:mt-0"
               >
                  <Form.Item<typeRegister>
                     label={<span className="text-base sm:text-lg md:text-xl font-bold">Họ và tên</span>}
                     name="fullName"
                     rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
                  >
                     <Input
                        id="fullname"
                        size="large"
                        className="text-base sm:text-lg md:text-xl"
                        placeholder="Nhập họ và tên của bạn"
                     />
                  </Form.Item>
                  
                  <Form.Item<typeRegister>
                     label={<span className="text-base sm:text-lg md:text-xl font-bold">Email</span>}
                     name="email"
                     rules={[
                        { required: true, message: "Vui lòng nhập email" },
                        { type: "email", message: "Email không hợp lệ" },
                     ]}
                  >
                     <Input
                        id="email"
                        size="large"
                        className="text-base sm:text-lg md:text-xl"
                        placeholder="Nhập địa chỉ email của bạn"
                     />
                  </Form.Item>
                  
                  <Form.Item<typeRegister>
                     label={<span className="text-base sm:text-lg md:text-xl font-bold">Mật khẩu</span>}
                     name="password"
                     rules={[
                        { required: true, message: "Vui lòng nhập mật khẩu" },
                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                     ]}
                  >
                     <Input.Password
                        id="password"
                        size="large"
                        className="text-base sm:text-lg md:text-xl"
                        placeholder="Nhập mật khẩu của bạn"
                     />
                  </Form.Item>
                  
                  <Form.Item<typeRegister>
                     label={<span className="text-base sm:text-lg md:text-xl font-bold">Xác nhận mật khẩu</span>}
                     name="confirmPassword"
                     dependencies={["password"]}
                     rules={[
                        { required: true, message: "Vui lòng nhập lại mật khẩu" },
                        ({ getFieldValue }) => ({
                           validator(_, value) {
                              if (!value || getFieldValue("password") === value) {
                                 return Promise.resolve();
                              }
                              return Promise.reject(new Error("Mật khẩu không khớp"));
                           },
                        }),
                     ]}
                  >
                     <Input.Password
                        id="confirm-password"
                        size="large"
                        className="text-base sm:text-lg md:text-xl"
                        placeholder="Nhập lại mật khẩu của bạn"
                     />
                  </Form.Item>
                  
                  <Form.Item>
                     <div>
                        <Button 
                           style={{ 
                              fontSize: '1rem',
                              fontWeight: 'bold', 
                              backgroundColor: '#FAE3B6' 
                           }} 
                           className="mt-2 sm:mt-3 w-full !py-4 sm:!py-5 md:!py-6 !text-black !hover:text-black sm:text-lg md:text-xl" 
                           shape="round" 
                           size="large"
                           htmlType='submit' 
                           disabled={loading} 
                           loading={loading}
                        >
                           Đăng ký
                        </Button>
                     </div>
                  </Form.Item>
               </Form>
               
               <div className="flex items-center my-2 sm:my-0">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="mx-3 sm:mx-4 text-gray-500 text-base sm:text-lg md:text-xl font-normal">OR</span>
                  <div className="flex-grow border-t border-gray-300"></div>
               </div>
               
               <div className="w-full flex justify-center">
                  <GoogleLogin
                     onSuccess={credentialResponse => {
                        handleLoginWithGoogle(credentialResponse?.credential)
                     }}
                     onError={() => {
                        console.log('Login Failed');
                     }} 
                  />
               </div>
            </div>
         </div>
      </div>
   )
}