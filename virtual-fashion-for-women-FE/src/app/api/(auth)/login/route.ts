import { NextResponse } from "next/server";
import { createApiInstance } from "@/api/instance";
import { jwtDecode } from "jwt-decode";
import { User } from "@/types/user";
import { messageToast } from "@/helpers/toastHelper";

export async function POST(request: Request) {
   try {
      const payload = await request.json();
      const api = createApiInstance(request);
      const responseBE = await api.post('/auth/login', payload);
      if (responseBE?.status === 200) {
         const jwtToken = responseBE.data?.data;
         const decodedToken = jwtDecode(jwtToken) as any;
         const maxAge = decodedToken.exp - Math.floor(Date.now() / 1000);

         const user: User = {
            id: decodedToken.UserID,
            role: decodedToken.role.toLowerCase(),
         };

         const nextResponse = NextResponse.json({
            message: "Đăng nhập thành công.",
            user: user,
         }, { status: 200 });
         nextResponse.cookies.set('token', jwtToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            domain: process.env.NODE_ENV === 'production' ? '.onlinewomanfashion.store' : undefined,
            maxAge: maxAge,
            path: '/',
         });

         return nextResponse;
      }
      return NextResponse.json({ message: "Đăng nhập thất bại." }, { status: 401 });
   } catch (error) {
      console.error("Server login error", error);
      return NextResponse.json({
         message: "Đăng nhập thất bại.",
      }, { status: 401 });
   }
}
