"use client"; 

import { useState, useRef, useEffect } from 'react';
import { Search, Bell, UserCircle, Menu, LogOut} from 'lucide-react';

export default function AdminHeader({ toggleSidebar }: { toggleSidebar: () => void }) {
  // 1. State để quản lý trạng thái của dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 2. Ref để tham chiếu đến div của dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Nếu dropdown đang mở và người dùng click vào vị trí không nằm trong dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    // Thêm event listener khi dropdown được mở
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Dọn dẹp event listener khi component unmount hoặc dropdown đóng
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]); 

  return (
    <header className="flex items-center justify-between h-16 bg-white border-b border-gray-200 px-4 md:px-6">
      <div className="flex items-center">
        {/* Nút Hamburger */}
        <button
          onClick={toggleSidebar}
          className="md:hidden mr-4 text-gray-600 focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search Bar */}
        <div className="hidden md:flex items-center">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="ml-2 bg-transparent focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4 md:space-x-6">
        {/* Notification Icon */}
        <button className="relative">
          <Bell className="w-6 h-6 text-gray-600" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="relative">
          <button onClick={toggleDropdown} className='cursor-pointer'>
            <UserCircle className="w-8 h-8 text-gray-600" />
          </button>

          {/* Nội dung Dropdown */}
          {isDropdownOpen && (
            <div
              ref={dropdownRef} 
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-50 py-1"
            >
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-semibold text-gray-800">Admin User</p>
                <p className="text-xs text-gray-500">admin@myshop.com</p>
              </div>
              <div className="border-t border-gray-100"></div>
              <button
                onClick={() => alert('Logging out...')}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};