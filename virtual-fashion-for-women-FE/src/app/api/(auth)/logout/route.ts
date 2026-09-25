import { createApiInstance } from "@/api/instance";
import { NextResponse } from "next/server";
import { cookies } from 'next/headers';

export async function POST(request: Request) {
   try {
      const api = createApiInstance(request);
      console.log("Calling backend logout API");
      const responseBE = await api.post('/auth/logout');
      if (responseBE.status === 200) {
         console.log("Calling backend logout API 2");
         //const cookieStore = await cookies();
         //cookieStore.delete('token');
         const res = NextResponse.json({ message: 'Logout successful' }, { status: 200 });
         const host = request.headers.get('host') || '';
         const isProdDomain = host.includes('onlinewomanfashion.store');

         res.cookies.delete({
            name: 'token',
            path: '/',
            domain: process.env.NODE_ENV === 'production' ? '.onlinewomanfashion.store' : undefined,
            domain: isProdDomain ? '.onlinewomanfashion.store' : undefined,
         });
         return res;
      }

   } catch (error) {
      return NextResponse.json({ message: 'Logout failed' }, { status: 500 });
   }
}
