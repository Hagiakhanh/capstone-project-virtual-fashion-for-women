"use client";
import { Input, Form } from "antd";
import { CloseOutlined } from '@ant-design/icons';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "antd";

import { typeLogin } from "@/types/auth";
import bgLogin from '../../../assets/auth/bg-login.png'
import googleIcon from '../../../assets/auth/GoogleIcon.webp'
import { api } from "@/api/instance";
import { useAuth } from "@/contexts/AuthContext";
import { messageToast } from "@/helpers/toastHelper";
import { GoogleLogin } from "@react-oauth/google";

function LoginPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const { loginSuccess } = useAuth();

  const handleLogin = async (values: typeLogin) => {
    try {
      const response = await api.post('/login', values);
      if (response.status === 200) {
        loginSuccess(response.data.user);
        messageToast.success("Đăng nhập thành công!");
        if (response.data.user.role === 'admin') {
          router.replace("/admin");
        } else if (response.data.user.role === 'staff') {
          router.replace("/staff");
        } else if (response.data.user.role === 'customer') {
          router.replace("/");
          window.location.reload();

        }
      } else {

      }

    } catch (error) {
      messageToast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      console.error("Login error:", error);
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
          window.location.reload();
        }
      } else {

      }
    } catch (error) {
      console.error("Login with Google error:", error);
    }
  }

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
          <Form<typeLogin>
            form={form}
            layout="vertical"
            onFinish={handleLogin}
          >
            <Form.Item<typeLogin>
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
            <Form.Item<typeLogin>
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

            <p className="underline text-right cursor-pointer mt-2 text-xl font-normal">
              Quên mật khẩu
            </p>
            <Form.Item>
              <div>
                <Button style={{ fontSize: '1.25rem', fontWeight: 'bold', backgroundColor: '#FAE3B6' }} className="mt-5 w-full !py-6 !text-black !hover:text-black" shape="round" size="large"
                  htmlType="submit"
                >
                  Đăng nhập
                </Button>
              </div>
            </Form.Item>
          </Form>
          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-4 text-gray-500 text-xl font-normal">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <div>
            <GoogleLogin
              onSuccess={credentialResponse => {
                handleLoginWithGoogle(credentialResponse?.credential)
              }}
              onError={() => {
                console.log('Login Failed');
              }} />
            {/* <Button icon={<img src={googleIcon.src} alt="Google" className="w-6 h-6" />} style={{ fontSize: '1.25rem', fontWeight: 'bold', backgroundColor: '#FFFFFF' }} className="mt-5 w-full !py-6 !text-black !hover:text-black !border-black" shape="round" size="large">
              Đăng nhập với Google
            </Button> */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
