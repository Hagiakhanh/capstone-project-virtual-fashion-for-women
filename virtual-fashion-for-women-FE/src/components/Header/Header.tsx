'use client';
import { SearchOutlined, UserOutlined, ShoppingCartOutlined, DownOutlined } from '@ant-design/icons';
import { Input, Dropdown, Button } from 'antd';
import logo from '../../assets/home/Logo.png';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { api } from '@/api/instance';
import { CartItemDTO } from '@/models/CartItemDTO';
import { useRouter } from 'next/navigation';

function HeaderComponent() {
   const router = useRouter();
   const { user } = useAuth();
   const [cartCount, setCartCount] = useState<number>(0);
   const [menuItems, setMenuItems] = useState([]);

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

   useEffect(() => {
      if (user?.role === 'customer') fetchCartTotal();
      fetchCategories();
   }, [user]);

   useEffect(() => {
      if (user?.role === 'customer') {
         const handleCartUpdated = () => fetchCartTotal();
         window.addEventListener("cart-updated", handleCartUpdated);
         return () => window.removeEventListener("cart-updated", handleCartUpdated);
      }
   }, [user]);

   return (
      <header className="bg-[#FAE3B6] border-b border-[#e5c28b]">
         <div className="flex items-center justify-between px-10 w-full">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => router.push('/')}>
               <img src={logo.src} alt="Logo" className="w-20 object-contain" />
            </div>

            {/* Menu trung tâm */}
            <ul className="flex gap-10 text-xl font-normal cursor-pointer">
               <Link href="/" className="hover:underline underline-offset-4">Trang chủ</Link>
               <Link href="/try-on" className="hover:underline underline-offset-4">Phòng thử đồ</Link>
               <Link href="/recommendation" className="hover:underline underline-offset-4">Phối đồ thông minh</Link>
               <li>
                  <Dropdown menu={{ items: menuItems }} placement="bottom">
                     <span className="flex items-center hover:underline underline-offset-4">
                        Danh mục sản phẩm
                        <DownOutlined className="ml-1 text-sm" />
                     </span>
                  </Dropdown>
               </li>
            </ul>

            {/* Tìm kiếm và icon */}
            <div className="flex items-center gap-6">
               <div className="relative w-64">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FFAF37]">
                     <SearchOutlined className="text-lg" />
                  </div>
                  <Input
                     placeholder="Tìm kiếm sản phẩm"
                     className="rounded-full text-base"
                     style={{
                        paddingLeft: '2.5rem',
                        fontSize: '1rem',
                        height: '40px'
                     }}
                  />
               </div>

               {user?.role === 'customer' ? (
                  <div className="flex items-center gap-4">
                     <UserOutlined
                        className="text-2xl cursor-pointer"
                        onClick={() => router.push('/account')}
                     />

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
