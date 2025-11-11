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

export default function RegisterPage() {
   const router = useRouter();
   const [form] = Form.useForm();
   const [loading, setLoading] = useState<boolean>(false);

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

   return (
      <div className="w-[100vw] h-[100vh] flex justify-center items-center bg-cover bg-center"
         style={{ backgroundImage: `url(${bgRegister.src})` }}
      >
         <div className="bg-[white] w-[50%] rounded-2xl flex flex-col items-center py-20 relative">
            <div className="absolute top-6 right-6 cursor-pointer"
               onClick={() => { router.push("/") }}
            >
               <CloseOutlined style={{ fontSize: '1.5rem', color: '#888' }} />
            </div>
            <div className="w-[60%] mx-auto flex flex-col">
               <h1 className="font-bold text-6xl text-center">
                  Đăng ký
               </h1>
               <p className="mt-4 font-normal text-xl text-center">
                  Bạn đã có tài khoản? <Link href="/login" className="cursor-pointer underline">Đăng nhập ngay</Link>
               </p>
               <Form<typeRegister>
                  form={form}
                  layout="vertical"
                  onFinish={handleRegister}
               >
                  <Form.Item<typeRegister>
                     label={<span className="text-xl font-bold">Họ và tên</span>}
                     name="fullName"
                     className=""
                     rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
                  >
                     <Input
                        id="fullname"
                        size="middle"
                        style={{ fontSize: "1.25rem" }}
                        placeholder="Nhập họ và tên của bạn"
                     />
                  </Form.Item>
                  <Form.Item<typeRegister>
                     label={<span className="text-xl font-bold">Email</span>}
                     name="email"
                     rules={[
                        { required: true, message: "Vui lòng nhập email" },
                        { type: "email", message: "Email không hợp lệ" },
                     ]}
                  >
                     <Input
                        id="email"
                        size="middle"
                        style={{ fontSize: "1.25rem" }}
                        placeholder="Nhập địa chỉ email của bạn"
                     />
                  </Form.Item>
                  <Form.Item<typeRegister>
                     label={<span className="text-xl font-bold">Mật khẩu</span>}
                     name="password"
                     rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                  >
                     <Input.Password
                        id="password"
                        size="middle"
                        style={{ fontSize: "1.25rem" }}
                        placeholder="Nhập mật khẩu của bạn"
                     />
                  </Form.Item>
                  <Form.Item<typeRegister>
                     label={<span className="text-xl font-bold">Xác nhận mật khẩu</span>}
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
                        size="middle"
                        style={{ fontSize: "1.25rem" }}
                        placeholder="Nhập lại mật khẩu của bạn"
                     />
                  </Form.Item>
                  <Form.Item>
                     <div>
                        <Button style={{ fontSize: '1.25rem', fontWeight: 'bold', backgroundColor: '#FAE3B6' }} className="mt-3 w-full !py-6 !text-black !hover:text-black" shape="round" size="large"
                           htmlType='submit' disabled={loading} loading={loading}
                        >Đăng ký</Button>
                     </div>
                  </Form.Item>
               </Form>
               <div className="flex items-center">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="mx-4 text-gray-500 text-xl font-normal">OR</span>
                  <div className="flex-grow border-t border-gray-300"></div>
               </div>
               <div>
                  <Button icon={<img src={googleIcon.src} alt="Google" className="w-6 h-6" />} style={{ fontSize: '1.25rem', fontWeight: 'bold', backgroundColor: '#FFFFFF' }} className="mt-5 w-full !py-6 !text-black !hover:text-black !border-black" shape="round" size="large">
                     Đăng ký với Google
                  </Button>
               </div>
            </div>
         </div>
      </div>
   )
}