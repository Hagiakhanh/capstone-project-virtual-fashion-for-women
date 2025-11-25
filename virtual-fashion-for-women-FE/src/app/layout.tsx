import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Spin } from "antd";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { defaultToastContainerProps } from "@/helpers/toastHelper";
import { AuthProvider } from "@/contexts/AuthContext";
import { Providers } from "@/contexts/GoogleProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Women's Fashion Store",
  description: "A platform for virtual fashion try-ons",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <Providers>
          <AuthProvider>
            <Suspense fallback={<Spin />}>{children}</Suspense>
          </AuthProvider>
        </Providers>
        <ToastContainer {...defaultToastContainerProps} />
      </body>
    </html>
  );
}
