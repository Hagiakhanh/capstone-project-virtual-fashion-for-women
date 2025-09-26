import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  //const role = req.cookies.get("role")?.value;
  const url = req.nextUrl.clone();
  console.log('----------Check middleware runing----------');
  console.log('Token:', token);

  // Kiểm tra xem người dùng đã đăng nhập hay chưa
  if (token && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', req.url));
  }
  // Các route cho customer
  const customerRoutes = [
    "/cart"
  ];
  const isProtectedRoute = url.pathname.startsWith("/admin") || url.pathname.startsWith("/staff") || customerRoutes.some((route) => url.pathname.startsWith(route));
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const decoded = await jwtVerify(token, secret);
      const role = decoded.payload.role;

      // Rule cho admin
      if (url.pathname.startsWith("/admin") && role !== "Admin") {
        url.pathname = "/unauthorized";
        return NextResponse.redirect(url);
      }

      // Rule cho staff
      if (url.pathname.startsWith("/staff") && role !== "Staff") {
        url.pathname = "/unauthorized";
        return NextResponse.redirect(url);
      }

      // Rule cho customer
      if (customerRoutes.some((route) => url.pathname.startsWith(route)) && role !== "Customer") {
        url.pathname = "/unauthorized";
        return NextResponse.redirect(url);
      }

    } catch (error) {
      console.log('Invalid token or no token present');
      const response = NextResponse.redirect(new URL('/login', req.url));
      response.cookies.delete("token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/login", "/cart"], // áp dụng cho route nào
};
