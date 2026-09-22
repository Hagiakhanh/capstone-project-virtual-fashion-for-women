'use client';
import { SearchOutlined, UserOutlined, ShoppingCartOutlined, DownOutlined, BellOutlined, WalletOutlined, MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { Input, Dropdown, Button, Drawer } from 'antd';
import logo from '../../assets/home/Logo.png';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { api } from '@/api/instance';
import { CartItemDTO } from '@/models/CartItemDTO';
import { useRouter } from 'next/navigation';
import * as signalR from '@microsoft/signalr'
import { messageToast } from '@/helpers/toastHelper';
import { PaginationDTO } from '@/models/PaginationDTO';
import { ResponseNotification } from '@/models/NotificationDTO';
import formatDate from '@/utils/formatDate';
import formatPrice from '@/utils/formatPrice';

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
   const [searchText, setSearchText] = useState("");
   const [showSearchBox, setShowSearchBox] = useState(false);
   const [searchResults, setSearchResults] = useState<any[]>([]);
   const debounceTimer = useRef<any>(null);
   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
               key: String(category.categoryName),
               label: <span style={{ fontSize: '1rem' }}>{category.categoryName}</span>,
               onClick: ({ key }: any) => {
                  router.push(`/products?category=${key}`);
                  setMobileMenuOpen(false);
               }
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
         setMobileMenuOpen(false);
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

   const fetchSearchResults = async (keyword: string) => {
      if (!keyword.trim()) {
         setSearchResults([]);
         return;
      }

      const searchKeyword = keyword.trim();
      const response = await api.get('/product/search', {
         params: {
            PageIndex: 1,
            PageSize: 5,
            ProductName: searchKeyword
         }
      })

      if (response.status === 200) {
         setSearchResults(response?.data);
      } else {
         setSearchResults([]);
      }
   };

   const handleSearchChange = (e: any) => {
      const valueSearch = e.target.value;
      setSearchText(valueSearch);

      if (debounceTimer.current) {
         clearTimeout(debounceTimer.current);
      }
      debounceTimer.current = setTimeout(() => {
         fetchSearchResults(valueSearch);
      }, 400);

      setShowSearchBox(true);
   }

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
         const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${process.env.NEXT_PUBLIC_SIGNALR_URL}/notificationhub`, {
               withCredentials: true
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
         <div className="flex items-center justify-between px-4 md:px-10 w-full py-2 md:py-0">
            {/* Mobile: Logo + Search + Hamburger */}
            <div className="flex items-center gap-3 w-full md:hidden">
               {/* Logo */}
               <div className="flex items-center cursor-pointer flex-shrink-0" onClick={() => router.push('/')}>
                  <img src={logo.src} alt="Logo" className="w-12 h-12 object-contain" />
               </div>

               {/* Search Box */}
               <div className='flex-1 relative'>
                  <Input
                     placeholder="Tìm kiếm sản phẩm"
                     size="middle"
                     className="!pr-10"
                     style={{
                        paddingLeft: '0.75rem',
                        borderRadius: '9999px',
                        fontSize: '14px',
                     }}
                     value={searchText}
                     onChange={handleSearchChange}
                     onFocus={() => setShowSearchBox(true)}
                     onBlur={() => setTimeout(() => setShowSearchBox(false), 200)}
                     onKeyDown={(e) => {
                        if (e.key === "Enter") {
                           if (searchText.trim().length > 0) {
                              router.push(`/search?keyword=${encodeURIComponent(searchText.trim())}`);
                              setShowSearchBox(false);
                              setSearchText('');
                              setSearchResults([]);
                           }
                        }
                     }}
                  />
                  <div
                     className='absolute z-30 right-2 top-1/2 -translate-y-1/2 flex items-center cursor-pointer'
                     onClick={() => {
                        if (searchText.trim().length > 0) {
                           router.push(`/search?keyword=${encodeURIComponent(searchText.trim())}`);
                           setShowSearchBox(false);
                           setSearchText('');
                           setSearchResults([]);
                        }
                     }}
                  >
                     <SearchOutlined className='text-lg !text-[#FFAF37]' />
                  </div>

                  {showSearchBox && searchResults.length > 0 && (
                     <div
                        className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg p-2 z-50 overflow-auto max-h-96">
                        {searchResults.map((item, index) => (
                           <div
                              key={index}
                              className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer rounded-lg"
                              onClick={() => {
                                 router.push(`/products/${item?.productSlug}`);
                                 setShowSearchBox(false);
                                 setSearchText('');
                                 setSearchResults([]);
                              }}
                           >
                              <img src={item?.mainImageUrl} alt="" className="w-12 h-12 rounded object-cover flex-shrink-0" />
                              <div className="flex flex-col flex-1 min-w-0">
                                 <span className="font-normal text-black text-sm line-clamp-1">{item?.productName}</span>
                                 <span className="font-semibold text-black text-sm">{item?.price ? formatPrice(item?.price) : ''}đ</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               {/* Hamburger Menu */}
               <MenuOutlined
                  className="text-2xl cursor-pointer flex-shrink-0"
                  onClick={() => setMobileMenuOpen(true)}
               />
            </div>

            {/* Desktop: Logo */}
            <div className="hidden md:flex items-center cursor-pointer" onClick={() => router.push('/')}>
               <img src={logo.src} alt="Logo" className="w-20 object-contain" />
            </div>

            {/* Desktop Menu */}
            <ul className="hidden lg:flex gap-10 text-xl font-normal cursor-pointer">
               <Link href="/" className="flex items-center border-b-3 border-transparent hover:border-b-3 hover:border-black transition-all duration-100">Trang chủ</Link>
               <Link href="/try-on" className="flex items-center border-b-3 border-transparent hover:border-b-3 hover:border-black transition-all duration-100">Phòng thử đồ</Link>
               <li onClick={() => router.push("/recommendation")} className="flex items-center border-b-3 border-transparent hover:border-b-3 hover:border-black transition-all duration-100">Phối đồ thông minh</li>
               <li className='flex items-center border-b-3 border-transparent hover:border-b-3 hover:border-black transition-all duration-100'>
                  <Dropdown menu={{ items: menuItems }} placement="bottom">
                     <span className="flex items-center h-full">
                        Danh mục sản phẩm
                        <DownOutlined className="ml-1 text-sm" />
                     </span>
                  </Dropdown>
               </li>
            </ul>

            {/* Desktop: Search + Icons */}
            <div className="hidden md:flex items-center gap-6">
               {/* Desktop Search */}
               <div className='relative max-w-md'>
                  <div className='absolute z-30 left-4 top-1/2 -translate-y-1/2 flex items-center'>
                     <SearchOutlined className='text-xl !text-[#FFAF37]' />
                  </div>
                  <Input placeholder="Tìm kiếm sản phẩm"
                     size="middle"
                     style={{
                        paddingLeft: '3rem',
                        borderRadius: '9999px',
                        fontSize: '16px',
                     }}
                     value={searchText}
                     onChange={handleSearchChange}
                     onFocus={() => setShowSearchBox(true)}
                     onBlur={() => setTimeout(() => setShowSearchBox(false), 200)}
                     onKeyDown={(e) => {
                        if (e.key === "Enter") {
                           if (searchText.trim().length > 0) {
                              router.push(`/search?keyword=${encodeURIComponent(searchText.trim())}`);
                              setShowSearchBox(false);
                              setSearchText('');
                              setSearchResults([]);
                           }
                        }
                     }}
                  />
                  {showSearchBox && searchResults.length > 0 && (
                     <div style={{ width: '150%' }}
                        className="absolute right-0 top-full mt-2 w-full bg-white rounded-lg shadow-lg p-2 z-40 overflow-auto max-h-96">
                        {searchResults.map((item, index) => (
                           <div
                              key={index}
                              className="flex items-center gap-3 p-2 hover:bg-gray-100 cursor-pointer"
                              onClick={() => {
                                 router.push(`/products/${item?.productSlug}`);
                                 setShowSearchBox(false);
                                 setSearchText('');
                                 setSearchResults([]);
                              }}
                           >
                              <img src={item?.mainImageUrl} alt="" className="w-12 h-12 rounded object-cover" />
                              <div className="flex flex-col">
                                 <span className="font-normal text-black line-clamp-1">{item?.productName}</span>
                                 <span className="font-semibold text-black line-clamp-1">{item?.price ? formatPrice(item?.price) : ''}đ</span>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
               </div>

               {user?.role === 'customer' ? (
                  <div className="flex items-center gap-4">
                     {/* Desktop User Dropdown */}
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

                     {/* Cart */}
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

                     {/* Wallet */}
                     <div
                        className="relative cursor-pointer"
                        onClick={() => router.push('/wallet')}
                     >
                        <WalletOutlined className="text-2xl" />
                     </div>

                     {/* Notifications */}
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

         {/* Mobile Menu Drawer */}
         <Drawer
            title={
               <div className="flex items-center gap-3">
                  <img src={logo.src} alt="Logo" className="w-12 object-contain" />
                  <span className="text-lg font-semibold">Women Fashion</span>
               </div>
            }
            placement="right"
            onClose={() => setMobileMenuOpen(false)}
            open={mobileMenuOpen}
            width={280}
         >
            <div className="flex flex-col gap-4 h-full">
               {/* User Section - if logged in */}
               {user?.role === 'customer' && (
                  <div className="pb-4 border-b border-gray-200">
                     <div
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => {
                           router.push('/account');
                           setMobileMenuOpen(false);
                        }}
                     >
                        <UserOutlined className="text-xl" />
                        <span className="text-base">Tài khoản của tôi</span>
                     </div>
                     <div
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => {
                           router.push('/wallet');
                           setMobileMenuOpen(false);
                        }}
                     >
                        <WalletOutlined className="text-xl" />
                        <span className="text-base">Ví của tôi</span>
                     </div>
                     <div
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => {
                           router.push('/cart');
                           setMobileMenuOpen(false);
                        }}
                     >
                        <ShoppingCartOutlined className="text-xl" />
                        <div className="flex items-center justify-between flex-1">
                           <span className="text-base">Giỏ hàng</span>
                           {cartCount > 0 && (
                              <span className="bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center">
                                 {cartCount > 99 ? '99+' : cartCount}
                              </span>
                           )}
                        </div>
                     </div>
                     <div
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => {
                           router.push('/account/notifications');
                           setMobileMenuOpen(false);
                        }}
                     >
                        <BellOutlined className="text-xl" />
                        <div className="flex items-center justify-between flex-1">
                           <span className="text-base">Thông báo</span>
                           {notificationCount > 0 && (
                              <span className="bg-red-600 text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center">
                                 {notificationCount > 99 ? '99+' : notificationCount}
                              </span>
                           )}
                        </div>
                     </div>
                  </div>
               )}

               {/* Menu Items */}
               <div
                  className="text-base p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => {
                     router.push('/');
                     setMobileMenuOpen(false)
                  }}
               >
                  Trang chủ
               </div>
               <div
                  className="text-base p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => {
                     router.push('/try-on');
                     setMobileMenuOpen(false)
                  }}
               >
                  Phòng thử đồ
               </div>
               <div
                  className="text-base p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => {
                     router.push('/recommendation');
                     setMobileMenuOpen(false);
                  }}
               >
                  Phối đồ thông minh
               </div>

               {/* Categories */}
               <div className="border-t border-gray-200 pt-4">
                  {/* <div className="text-sm font-semibold mb-2 px-3 text-gray-500">DANH MỤC SẢN PHẨM</div>
                  {menuItems.map((item: any) => (
                     <div
                        key={item.key}
                        className="text-base p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                        onClick={() => item.onClick({ key: item.key })}
                     >
                        {item.label}
                     </div>
                  ))} */}
                  <Dropdown menu={{ items: menuItems }} placement="bottom">
                     <span className="text-base font-semibold mb-2 px-3 text-gray-500">
                        Danh mục sản phẩm
                        <DownOutlined className="text-base p-3 hover:bg-gray-50 rounded-lg cursor-pointer" />
                     </span>
                  </Dropdown>
               </div>

               {/* Login/Logout Section at Bottom */}
               <div className="mt-auto pt-4 border-t border-gray-200">
                  {user?.role === 'customer' ? (
                     <Button
                        danger
                        block
                        onClick={handleLogout}
                        className="!text-base"
                     >
                        Đăng xuất
                     </Button>
                  ) : (
                     <div className="flex flex-col gap-3">
                        <Button
                           block
                           className="!py-2 !text-base !border-black !text-black hover:!text-black"
                           style={{ borderWidth: '2px' }}
                           onClick={() => {
                              router.push('/login');
                              setMobileMenuOpen(false);
                           }}
                        >
                           Đăng nhập
                        </Button>
                        <Button
                           block
                           className="!py-2 !text-base !bg-[#FFAF37] !border-none !text-black hover:!text-black"
                           onClick={() => {
                              router.push('/register');
                              setMobileMenuOpen(false);
                           }}
                        >
                           Đăng ký
                        </Button>
                     </div>
                  )}
               </div>
            </div>
         </Drawer>
      </header>
   );
}

export default HeaderComponent;