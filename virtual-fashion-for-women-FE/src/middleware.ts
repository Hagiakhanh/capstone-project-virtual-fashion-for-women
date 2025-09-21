import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const role = req.cookies.get("role")?.value;
  const url = req.nextUrl.clone();
  // if (!token || role == null) {
  //   if (url.pathname.startsWith("/admin")) {
  //     url.pathname = "/admin/login";
  //   } else if (url.pathname.startsWith("/staff")) {
  //     url.pathname = "/staff/login";
  //   }
  //   return NextResponse.redirect(url);
  // }
  // if (url.pathname.startsWith("/admin") && role !== null && role !== "admin") {
  //   url.pathname = "/unauthorized";
  //   return NextResponse.redirect(url);
  // }

  // if (url.pathname.startsWith("/staff") && role !== null && role !== "staff") {
  //   url.pathname = "/unauthorized";
  //   return NextResponse.redirect(url);
  // }
  return NextResponse.next();
}

// export const config = {
//   matcher: ["/admin/:path*", "/staff/:path*"], // áp dụng cho route nào
// };
