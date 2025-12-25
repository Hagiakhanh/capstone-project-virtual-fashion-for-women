import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode'
import { User } from "@/types/user";

export async function GET(request: Request) {
   try {
      const token = (await cookies()).get('token')?.value;
      const user: User = { role: 'guest' };
      if (!token) {
         return NextResponse.json({ message: "Unauthenticated", user }, { status: 200 });
      }
      const decoded = jwtDecode(token) as any;
      user.id = decoded.UserID;
      user.email = decoded.email;
      user.name = decoded.name;
      switch (decoded.role) {
         case 'Admin':
            user.role = 'admin';
            break;
         case 'Staff':
            user.role = 'staff';
            break;
         case 'Customer':
            user.role = 'customer';
            break;
         default:
            user.role = 'guest';
            break;
      }
      return NextResponse.json({ message: "Authenticated", user }, { status: 200 });

   } catch (error) {
      console.error("Failed to check auth status:", error);
      return NextResponse.json({ message: "Kiểm tra trạng thái đăng nhập thất bại" }, { status: 500 });
   }
}