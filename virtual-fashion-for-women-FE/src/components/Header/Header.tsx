'use client';
import { SearchOutlined, UserOutlined, ShoppingCartOutlined, DownOutlined, BellOutlined, WalletOutlined } from '@ant-design/icons';
import { Input, Dropdown, Button } from 'antd';
import logo from '../../assets/home/Logo.png';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { api } from '@/api/instance';
import { CartItemDTO } from '@/models/CartItemDTO';
import { useRouter } from 'next/navigation';
import * as signalR from '@microsoft/signalr'
import { messageToast } from '@/helpers/toastHelper';
import { PaginationDTO } from '@/models/PaginationDTO';
import { set } from 'lodash';
import { ResponseNotification } from '@/models/NotificationDTO';
import formatDate from '@/utils/formatDate';

function HeaderComponent() {
   const router = useRouter();
   const { user, logout } = useAuth();
   const [cartCount, setCartCount] = useState<number>(0);
   const [menuItems, setMenuItems] = useState([]);
   const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
   const [notifications, setNotifications] = useState<ResponseNotification[]>([]);
   const [pagination, setPagination] = useState<PaginationDTO>({
      CurrentPage: 1,
      HasNext: false,
      HasPrevious: false,
      PageSize: 5,
      TotalCount: 0,
      TotalPages: 0,
   });
   const [notificationCount, setNotificationCount] = useState<number>(0);

   const fetchCartTotal = async () => {
      try {
         const res = await api.get('/cartItem');
         if (res.status == 200) {
            const data: CartItemDTO[] = res.data;
            setCartCount(data.reduce((total, item) => total + item.quantityItem, 0));
         }
      } catch (error) {
         console.error("Lỗi khi lấy tổng giỏ hàng:", error);
      }
   };

   const fetchCategories = async () => {
      try {
         const response = await api.get('/category');
         if (response.status === 200) {
            const newItems = response.data.map((category: any) => ({
               key: String(category.categoryId),
               label: <span style={{ fontSize: '1rem' }}>{category.categoryName}</span>,
            }));
            setMenuItems(newItems);
         } else {
            setMenuItems([]);
         }
      } catch (error) {
         console.error("Lỗi khi lấy danh mục:", error);
      }
   };

   const fetchNotifications = async () => {
      try {
         fetchUnreadNotificationCount();
         const payloadPagination = {
            pageSize: pagination.PageSize,
            pageNumber: pagination.CurrentPage,
         }
         const response = await api.get(`/notification`, { params: payloadPagination });
         if (response.status === 200) {
            setNotifications(response.data.data);
            console.log("Notifications fetched:", response.data.data);
            // setPagination((prev) => ({
            //    ...prev,
            //    ...response.data.pagination
            // }));
         }
      } catch (error: any) {
         console.error("Lỗi khi lấy thông báo:", error);
      }
   }

   const fetchUnreadNotificationCount = async () => {
      try {
         const response = await api.get('/notification/unread-count');

         if (response.status === 200) {
            setNotificationCount(response.data.data);
         }
      } catch (error) {
         console.error("Lỗi khi lấy số lượng thông báo chưa đọc:", error);
      }
   }

   const handleLogout = async () => {
      try {
         await logout();
      } catch (err) {
         console.error('Lỗi khi đăng xuất:', err);
      }
   };

   const markAsRead = async (id: number) => {
      try {
         const response = await api.get(`/notification/${id}`);
         if (response.status === 200) {
            const data: ResponseNotification = response.data;
            setNotifications((prev) =>
               prev.map((n) =>
                  n.notificationId === data.notificationId
                     ? { ...n, ...data }
                     : n
               )
            );
            setNotificationCount((prev) => Math.max(prev - 1, 0));
         }
      } catch (error: any) {
         console.error("Lỗi khi đánh dấu thông báo đã đọc:", error);
      }
   };

   useEffect(() => {
      if (user?.role === 'customer') fetchCartTotal();
      fetchCategories();
   }, [user]);

   useEffect(() => {
      if (user?.role === 'customer') {
         const handleCartUpdated = () => fetchCartTotal();
         fetchNotifications();
         window.addEventListener("cart-updated", handleCartUpdated);
         window.addEventListener("notification-updated", fetchNotifications);
         console.log(`${process.env.NEXT_PUBLIC_SIGNALR_URL}/notificationhub`);
         const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${process.env.NEXT_PUBLIC_SIGNALR_URL}/notificationhub`, {
               withCredentials: true,
               skipNegotiation: true,
               transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .configureLogging(signalR.LogLevel.Information)
            .build()

         setConnection(newConnection)
         return () => window.removeEventListener("cart-updated", handleCartUpdated);
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
               await connection.invoke('JoinNotificationGroup', user.id)
                  .then(() => console.log('✅ Joined group:', user.id))
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
      })

      connection.onclose(() => {
         console.warn('⚠️ SignalR disconnected, will auto reconnect...')
      })

      return () => {
         connection.off('ReceiveNotification')
         connection.stop()
      }
   }, [connection, user])

   const notificationMenu = {
      items: [
         ...notifications.map((n) => ({
            key: n.notificationId.toString(),
            label: (
               <div
                  className={`flex flex-col gap-0.5 px-1 py-1.5 rounded-md transition-all
            ${!n.isRead ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}
               >
                  <div className="flex items-start gap-2">
                     {!n.isRead && (
                        <span className="w-2 h-2 mt-1.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                     )}
                     <div className="flex flex-col">
                        <span
                           className={`font-medium text-sm ${!n.isRead ? 'text-blue-800' : 'text-gray-800'
                              }`}
                        >
                           {n.title}
                        </span>
                        <span className="text-xs text-gray-500">{formatDate(n.createdAt)}</span>
                     </div>
                  </div>
               </div>
            ),
         })),
         {
            type: 'divider' as const,
         },
         {
            key: 'view-more',
            label: (
               <div className="text-center text-blue-600 font-medium cursor-pointer hover:underline">
                  Xem thêm
               </div>
            ),
         },
      ],

      onClick: ({ key }: { key: string }) => {
         if (key === 'view-more') {
            router.push('/account/notifications');
            return;
         }
         markAsRead(Number(key));
      },
   };


   return (
      <header className="bg-[#FAE3B6] border-b border-[#e5c28b]">
         <div className="flex items-center justify-between px-10 w-full">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
               <img src={logo.src} alt="Logo" className="w-20 object-contain" />
            </div>

            {/* Menu trung tâm */}
            <ul className="flex gap-10 text-xl font-normal cursor-pointer">
               <Link href="/" className="flex items-center border-b-3 border-transparent hover:border-b-3 hover:border-black transition-all duration-100">Trang chủ</Link>
               <Link href="/cart" className="flex items-center border-b-3 border-transparent hover:border-b-3 hover:border-black transition-all duration-100">Phòng thử đồ</Link>
               <li className='flex items-center border-b-3 border-transparent hover:border-b-3 hover:border-black transition-all duration-100'>
                  <Dropdown menu={{ items: menuItems }} placement="bottom">
                     <span className="flex items-center h-full">
                        Danh mục sản phẩm
                        <DownOutlined className="ml-1 text-sm" />
                     </span>
                  </Dropdown>
               </li>
            </ul>
            <div onClick={() => router.push("/recommendation")} className="flex items-center border-b-3 border-transparent hover:border-b-3 hover:border-black transition-all duration-100">Phối đồ thông minh</div>

            {/* Tìm kiếm và icon */}
            <div className="flex items-center gap-6">
               <div className="relative w-64">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFAF37]">
                     <SearchOutlined className="text-lg" />
                  </div>
                  <Input
                     placeholder="Tìm kiếm sản phẩm"
                     className="rounded-full text-base"
                  />
               </div>
               <div
                        className="relative cursor-pointer"
                        onClick={() => router.push('/cart')}
                     >
                        <ShoppingCartOutlined className="text-3xl" />
                        {cartCount > 0 && (
                           <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white">
                              {cartCount > 99 ? '99+' : cartCount}
                           </span>
                        )}
                     </div>
               {user?.role === 'customer' ? (
                  <div className="flex items-center gap-4">

                     <Dropdown
                        trigger={['hover']}
                        placement="bottomRight"
                        menu={{
                           items: [
                              {
                                 key: 'account',
                                 label: <span className="text-base">Tài khoản của tôi</span>,
                                 onClick: () => router.push('/account'),
                              },
                              {
                                 key: 'logout',
                                 label: <span className="text-red-500 text-base">Đăng xuất</span>,
                                 onClick: handleLogout,
                              },
                           ],
                        }}
                     >
                        <UserOutlined className="text-2xl cursor-pointer" />
                     </Dropdown>
                     <Link href="/cart" className="flex items-center border-b-3 border-transparent hover:border-b-3 hover:border-black transition-all duration-100">Phòng thử đồ</Link>
                     
                     {/* Wallet */}
                     <div
                        className="relative cursor-pointer"
                        onClick={() => router.push('/wallet')}
                     >
                        <WalletOutlined className="text-2xl" />
                     </div>
                     <Dropdown
                        trigger={['click']}
                        placement="bottomRight"
                        menu={notificationMenu}
                     >
                        <div className="relative cursor-pointer">
                           <BellOutlined className="text-2xl" />
                           {notificationCount > 0 && (
                              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white">
                                 {notificationCount > 99 ? '99+' : notificationCount}
                              </span>
                           )}
                        </div>
                     </Dropdown>
                  </div>
               ) : (
                  <div className="flex items-center gap-3">
                     <Link href="/login">
                        <Button
                           className="!py-1 !px-4 !rounded-full !text-base !border-black !text-black hover:!text-black"
                           style={{ borderWidth: '2px' }}
                        >
                           Đăng nhập
                        </Button>
                     </Link>
                     <Link href="/register">
                        <Button
                           className="!py-1 !px-4 !rounded-full !text-base !bg-[#FFAF37] !border-none !text-black hover:!text-black"
                        >
                           Đăng ký
                        </Button>
                     </Link>
                  </div>
               )}
            </div>
         </div>
      </header>
   );
}

export default HeaderComponent;
