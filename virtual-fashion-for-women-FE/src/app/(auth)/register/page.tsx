"use client";
import { CloseOutlined } from '@ant-design/icons';
import { Input } from "antd";
import { useRouter } from "next/navigation";

import bgRegister from '../../../assets/auth/bg-login.png'
import { AntButtonCommon } from "@/components/AntDesign/Button/AntButtonCommon";
import googleIcon from '../../../assets/auth/GoogleIcon.webp'
import Link from 'next/link';

export default function RegisterPage() {
   const router = useRouter();

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
               <div className="mt-6 text-xl">
                  <label htmlFor="fullname" className="font-bold">Họ và tên</label>
                  <Input id="fullname" style={{ fontSize: '1.25rem', marginTop: '0.5rem' }} size="middle" placeholder="Nhập họ và tên của bạn" />
               </div>
               <div className="mt-6 text-xl">
                  <label htmlFor="email" className="font-bold">Email</label>
                  <Input id="email" style={{ fontSize: '1.25rem', marginTop: '0.5rem' }} size="middle" className="text-xl" placeholder="Nhập mật khẩu của bạn" />
               </div>
               <div className="mt-6 text-xl">
                  <label htmlFor="password" className="font-bold">Mật khẩu</label>
                  <Input id="password" style={{ fontSize: '1.25rem', marginTop: '0.5rem' }} size="middle" className="text-xl" placeholder="Nhập mật khẩu của bạn" />
               </div>
               <div className="mt-6 text-xl">
                  <label htmlFor="confirm-password" className="font-bold">Xác nhận mật khẩu</label>
                  <Input id="confirm-password" style={{ fontSize: '1.25rem', marginTop: '0.5rem' }} size="middle" className="text-xl" placeholder="Nhập lại mật khẩu của bạn" />
               </div>
               <div>
                  <AntButtonCommon label="Đăng ký" style={{ fontSize: '1.25rem', fontWeight: 'bold', backgroundColor: '#FAE3B6' }} className="mt-6 w-full !py-6 !text-black !hover:text-black" shape="round" size="large" />
               </div>
               <div className="flex mt-7 items-center">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="mx-4 text-gray-500 text-xl font-normal">OR</span>
                  <div className="flex-grow border-t border-gray-300"></div>
               </div>
               <div>
                  <AntButtonCommon label="Đăng ký với Google" icon={<img src={googleIcon.src} alt="Google" className="w-6 h-6" />} style={{ fontSize: '1.25rem', fontWeight: 'bold', backgroundColor: '#FFFFFF' }} className="mt-5 w-full !py-6 !text-black !hover:text-black !border-black" shape="round" size="large" />
               </div>
            </div>
         </div>
      </div>
   )
}