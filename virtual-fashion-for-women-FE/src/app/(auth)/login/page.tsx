"use client";
import { Input } from "antd";
import { CloseOutlined } from '@ant-design/icons';
import Link from "next/link";
import { useRouter } from "next/navigation";

import { typeLogin } from "@/types/login";
import bgLogin from '../../../assets/auth/bg-login.png'
import googleIcon from '../../../assets/auth/GoogleIcon.webp'
import { AntButtonCommon } from "@/components/AntDesign/Button/AntButtonCommon";

function LoginPage({ params }: typeLogin) {
  const router = useRouter();

  return (
    <div className="w-[100vw] h-[100vh] flex justify-center items-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgLogin.src})` }}
    >
      <div className="bg-[white] w-[50%] rounded-2xl flex flex-col items-center py-20 relative">
        <div className="absolute top-6 right-6 cursor-pointer"
          onClick={() => { router.push("/") }}
        >
          <CloseOutlined style={{ fontSize: '1.5rem', color: '#888' }} />
        </div>
        <div className="w-[60%] mx-auto flex flex-col">
          <h1 className="font-bold text-6xl text-center">
            Đăng nhập
          </h1>
          <p className="mt-4 font-normal text-xl text-center">
            Bạn chưa có tài khoản? <Link href="/register" className="cursor-pointer underline">Đăng ký ngay</Link>
          </p>
          <div className="mt-6 text-xl">
            <label htmlFor="email" className="font-bold">Email</label>
            <Input id="email" style={{ fontSize: '1.25rem', marginTop: '0.5rem' }} size="middle" placeholder="Nhập địa chỉ email của bạn" />
          </div>
          <div className="mt-7 text-xl">
            <label htmlFor="password" className="font-bold">Mật khẩu</label>
            <Input id="password" style={{ fontSize: '1.25rem', marginTop: '0.5rem' }} size="middle" className="text-xl" placeholder="Nhập mật khẩu của bạn" />
          </div>
          <p className="underline text-right cursor-pointer mt-2 text-xl font-normal">
            Quên mật khẩu
          </p>
          <div>
            <AntButtonCommon label="Đăng nhập" style={{ fontSize: '1.25rem', fontWeight: 'bold', backgroundColor: '#FAE3B6' }} className="mt-5 w-full !py-6 !text-black !hover:text-black" shape="round" size="large" />
          </div>
          <div className="flex mt-7 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-xl font-normal">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <div>
            <AntButtonCommon label="Đăng nhập với Google" icon={<img src={googleIcon.src} alt="Google" className="w-6 h-6" />} style={{ fontSize: '1.25rem', fontWeight: 'bold', backgroundColor: '#FFFFFF' }} className="mt-5 w-full !py-6 !text-black !hover:text-black !border-black" shape="round" size="large" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
