import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Config: route nào role nào được phép
const routePermissions: Record<string, string[]> = {
  "/admin": ["Admin"],
  "/staff": ["Staff"],
  "/cart": ["Customer"],
  "/recommendation": ["Customer"],
  "/manage": ["Admin", "Staff"],
  "/profile": ["Admin", "Staff", "Customer"],
  "/payment/return": ["Customer"],
  "/account/chats": ["Customer"],
  "/account/aiConversations": ["Customer"],
  "/try-on": ["Customer"],
  "/checkout": ["Customer"],
  "/account": ["Customer"],
  "/account/orders": ["Customer"],
  "/account/transactions": ["Customer"],
  "/account/try-on-history": ["Customer"],

};

// Routes public (không cần login)

const publicRoutes = ["/login", "/register", "/confirm-email", "/products", "/ar-try-on"];

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const url = req.nextUrl.clone();
  console.log("Middleware running:", url.pathname);
  if (url.pathname === "/") {
    return;
  }

  // Nếu đã login mà vào /login thì redirect về home
  if (token && url.pathname === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Nếu route public thì cho qua
  const isPublicRoute = publicRoutes.some((route) => {
    if (url.pathname === route) {
      return true;
    }
    if (url.pathname.startsWith(`${route}/`)) {
      return true;
    }
    return false;
  });
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Nếu chưa login thì redirect về /login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const decoded = await jwtVerify(token, secret);
    const role = decoded.payload.role as string;

    console.log("Role:", role);

    // Tìm rule cho route hiện tại
    const matchedRoute = Object.keys(routePermissions).find((route) =>
      url.pathname.startsWith(route)
    );

    if (matchedRoute) {
      const allowedRoles = routePermissions[matchedRoute];
      if (!allowedRoles.includes(role)) {
        url.pathname = "/unauthorized";
        return NextResponse.redirect(url);
      }
    }
  } catch (error) {
    console.log("Invalid token");
    console.log(error)
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("token");
    return response;
  }

  return NextResponse.next();
}

// Middleware chỉ áp dụng cho page routes, exclude /api/*
export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico|robots.txt).*)"],
};
