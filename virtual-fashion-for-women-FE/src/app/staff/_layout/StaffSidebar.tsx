"use client"; // Hook usePathname yêu cầu đây phải là Client Component

import Link from "next/link";
import { usePathname } from "next/navigation"; // 1. Import hook usePathname
import { ShoppingBasket, MessagesSquare, Bell, X } from "lucide-react";

// Interface cho props
interface SidebarProps {
   isSidebarOpen: boolean;
   toggleSidebar: () => void;
}

export default function StaffSidebar({
   isSidebarOpen,
   toggleSidebar,
}: SidebarProps) {
   const pathname = usePathname();

   // Khi click vào một link trên mobile, đóng sidebar lại
   const handleLinkClick = () => {
      if (isSidebarOpen) {
         toggleSidebar();
      }
   };

   // 3. Hàm trợ giúp để xác định link có active không
   const isActive = (href: string) => {
      // Trường hợp đặc biệt cho dashboard, chỉ active khi khớp chính xác
      if (href === "/admin/dashboard") {
         return pathname === href;
      }
      // Các link khác sẽ active nếu URL hiện tại bắt đầu bằng href của link đó
      // Ví dụ: khi ở trang /admin/products/edit/1, link /admin/products vẫn active
      return pathname.startsWith(href);
   };

   // 4. Định nghĩa các class CSS để dễ quản lý
   const baseLinkClasses = "flex items-center px-4 py-2 rounded-md transition-colors duration-200";
   const activeLinkClasses = "bg-gray-900 text-white font-semibold";
   const inactiveLinkClasses = "text-gray-300 hover:bg-gray-700 hover:text-white";

   return (
      <>
         {/* Lớp Overlay mờ */}
         <div
            className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 md:hidden ${isSidebarOpen ? "opacity-60" : "opacity-0 pointer-events-none"
               }`}
            onClick={toggleSidebar}
         ></div>

         {/* Sidebar */}
         <aside
            className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
               }`}
         >
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
               <span className="text-2xl font-bold">My Shop</span>
               <button
                  onClick={toggleSidebar}
                  className="md:hidden text-gray-300 hover:text-white"
               >
                  <X className="w-6 h-6" />
               </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-2">
               {/* 5. Áp dụng logic vào className của mỗi Link */}
               <Link
                  onClick={handleLinkClick}
                  href="/staff"
                  className={`${baseLinkClasses} ${isActive("/admin/dashboard") ? activeLinkClasses : inactiveLinkClasses}`}
               >
                  <ShoppingBasket className="w-5 h-5 mr-3" />
                  Quản lý đơn hàng
               </Link>
               <Link
                  onClick={handleLinkClick}
                  href="/admin/orders"
                  className={`${baseLinkClasses} ${isActive("/admin/orders") ? activeLinkClasses : inactiveLinkClasses}`}
               >
                  <MessagesSquare className="w-5 h-5 mr-3" />
                  Tin nhắn hỗ trợ
               </Link>
               <Link
                  onClick={handleLinkClick}
                  href="/admin/product"
                  className={`${baseLinkClasses} ${isActive("/admin/product") ? activeLinkClasses : inactiveLinkClasses}`}
               >
                  <Bell className="w-5 h-5 mr-3" />
                  Thông báo
               </Link>
            </nav>
         </aside>
      </>
   );
}