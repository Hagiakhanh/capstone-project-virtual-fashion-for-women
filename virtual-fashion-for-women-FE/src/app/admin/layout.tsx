"use client"
// app/admin/layout.tsx
import AdminSidebar from "./_layout/AdminSidebar";
import AdminHeader from "./_layout/AdminHeader";
import { useState } from "react";

export default function AdminLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    // State để quản lý việc đóng/mở sidebar trên mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen);
    };
  
    return (
      <div className="flex h-screen bg-gray-100">
        {/* Truyền state và hàm toggle xuống Sidebar */}
        <AdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
  
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Truyền hàm toggle xuống Header */}
          <AdminHeader toggleSidebar={toggleSidebar} />
  
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            {children}
          </main>
        </div>
      </div>
    );
  }