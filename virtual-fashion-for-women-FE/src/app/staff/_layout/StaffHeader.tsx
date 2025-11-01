"use client";

import { useState, useRef, useEffect } from 'react';
import { Search, Bell, UserCircle, Menu, LogOut, Circle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/api/instance';
import { ResponseNotification } from '@/models/NotificationDTO';
import formatDate from '@/utils/formatDate';
import * as signalR from '@microsoft/signalr'
import { messageToast } from '@/helpers/toastHelper';

export default function StaffHeader({ toggleSidebar }: { toggleSidebar: () => void }) {
   // 1. State để quản lý trạng thái của dropdown
   const { user, logout } = useAuth();
   const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
   const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
   const [notifications, setNotifications] = useState<ResponseNotification[]>([]);
   const [unreadCount, setUnreadCount] = useState<number>(0);
   const [connection, setConnection] = useState<signalR.HubConnection | null>(null)


   // 2. Ref để tham chiếu đến div của dropdown
   const userDropdownRef = useRef<HTMLDivElement>(null);
   const notificationDropdownRef = useRef<HTMLDivElement>(null);

   const toggleUserDropdown = () => {
      setIsUserDropdownOpen((prev) => !prev);
      setIsNotificationDropdownOpen(false);
   };

   const toggleNotificationDropdown = () => {
      setIsNotificationDropdownOpen((prev) => !prev);
      setIsUserDropdownOpen(false);
   };

   const handleLogout = async () => {
      try {
         await logout();
      } catch (err) {
         console.error('Lỗi khi đăng xuất:', err);
      }
   };

   const fetchNotifications = async () => {
      try {
         const response = await api.get("/notification", { params: { pageSize: 5, pageNumber: 1 } });
         if (response.status === 200) {
            setNotifications(response.data.data);
            const unread = response.data.data.filter((n: ResponseNotification) => !n.isRead).length;
            setUnreadCount(unread);
         }
      } catch (error) {
         console.error("Lỗi khi lấy thông báo:", error);
      }
   };

   const markAsRead = async (id: number) => {
      try {
         const res = await api.get(`/notification/${id}`);
         if (res.status === 200) {
            setNotifications((prev) =>
               prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(prev - 1, 0));
         }
      } catch (error) {
         console.error("Lỗi khi đánh dấu đã đọc:", error);
      }
   };

   useEffect(() => {
      if (user?.role === 'staff') {
         fetchNotifications();
         window.addEventListener("notification-updated", fetchNotifications);
         const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${process.env.NEXT_PUBLIC_SIGNALR_URL}/notificationhub`, {
               withCredentials: true
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build()

         setConnection(newConnection)
         return () => window.removeEventListener("notification-updated", fetchNotifications);
      }
   }, [user]);


   useEffect(() => {
      if (!connection || !user?.id) return;

      const startConnection = async () => {
         try {
            console.log("User in hub connection:", user);
            console.log("Connection: ", connection)
            await connection.start().then(() => {
               console.log('SignalR connected successfully!')
            }).catch((err) => {
               console.error('SignalR connection failed:', err)
            })
            if (user?.id) {
               await connection.invoke('JoinNotificationStaffGroup')
                  .then()
                  .catch((err) => {
                     console.error('❌ Join group failed:', err?.message || err);
                  });
            }
         } catch (err) {
            console.error('SignalR connection error:', err)
         }
      }

      startConnection()

      connection.on('ReceiveNotification', (message: string) => {
         console.log('Nhận tin nhắn mới:', message)
         messageToast.info(message)
         fetchNotifications();
      })

      connection.onclose(() => {
         console.warn('⚠️ SignalR disconnected, will auto reconnect...')
      })

      return () => {
         connection.off('ReceiveNotification')
         connection.stop()
      }
   }, [connection, user])

   useEffect(() => {
      fetchNotifications();
      const handleClickOutside = (event: MouseEvent) => {
         const target = event.target as Node;

         if (
            userDropdownRef.current &&
            !userDropdownRef.current.contains(target) &&
            notificationDropdownRef.current &&
            !notificationDropdownRef.current.contains(target)
         ) {
            setIsUserDropdownOpen(false);
            setIsNotificationDropdownOpen(false);
         }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   return (
      <header className="flex items-center justify-end h-16 bg-white border-b border-gray-200 px-4 md:px-6">
         <div className="flex items-center space-x-4 md:space-x-6">
            {/* Notification Icon */}
            <div className="relative">
               <button onClick={toggleNotificationDropdown} className="relative">
                  <Bell className="w-8 h-8 text-gray-600" />
                  {unreadCount > 0 && (
                     <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount}
                     </span>
                  )}
               </button>

               {isNotificationDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                     <div className="p-3 border-b border-gray-100 font-semibold text-gray-800">
                        Thông báo
                     </div>
                     <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                           notifications.map((n) => (
                              <div
                                 key={n.notificationId}
                                 onClick={() => markAsRead(n.notificationId)}
                                 className={`px-4 py-3 text-sm cursor-pointer transition-all ${n.isRead
                                    ? "bg-white hover:bg-gray-50"
                                    : "bg-blue-50 hover:bg-blue-100"
                                    }`}
                              >
                                 <div className="flex items-start gap-2">
                                    {!n.isRead && (
                                       <Circle className="w-2.5 h-2.5 text-blue-600 mt-1" fill="currentColor" />
                                    )}
                                    <div className="flex flex-col">
                                       <span
                                          className={`font-medium ${n.isRead ? "text-gray-800" : "text-blue-800"
                                             }`}
                                       >
                                          {n.title}
                                       </span>
                                       <span className="text-xs text-gray-500">
                                          {formatDate(n.createdAt)}
                                       </span>
                                    </div>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <p className="text-center text-gray-500 text-sm py-4">
                              Không có thông báo
                           </p>
                        )}
                     </div>
                     <div className="border-t border-gray-100">
                        <button className="w-full text-center text-blue-600 font-medium text-sm py-2 hover:bg-blue-50">
                           Xem tất cả
                        </button>
                     </div>
                  </div>
               )}
            </div>

            <div className="relative">
               <button onClick={toggleUserDropdown} className='cursor-pointer'>
                  <UserCircle className="w-8 h-8 text-gray-600" />
               </button>

               {/* Nội dung Dropdown */}
               {isUserDropdownOpen && (
                  <div
                     ref={userDropdownRef}
                     className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-50 py-1"
                  >
                     <div className="px-4 py-2 border-b">
                        <p className="text-sm font-semibold text-gray-800">{user?.name || "Staff"}</p>
                        <p className="text-xs text-gray-500">{user?.email || "staff@myshop.com"}</p>
                     </div>
                     <div className="border-t border-gray-100"></div>
                     <button
                        onClick={handleLogout}
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