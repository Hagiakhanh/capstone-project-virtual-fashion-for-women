'use client';
import { SearchOutlined, UserOutlined, ShoppingCartOutlined, DownOutlined } from '@ant-design/icons';
import { Input, Dropdown } from 'antd';
import { Button } from "antd";

import logo from '../../assets/home/Logo.png';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { api } from '@/api/instance';
import { CartItemDTO } from '@/models/CartItemDTO';

function HeaderComponent() {
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
   }

   useEffect(() => {
      if (user?.role === 'customer') {
         fetchCartTotal();
      }
      fetchCategories();
   }, []);

   useEffect(() => {
      if (user?.role === 'customer') {
         const handleCartUpdated = () => fetchCartTotal();
         window.addEventListener("cart-updated", handleCartUpdated);
         return () => window.removeEventListener("cart-updated", handleCartUpdated);
      }
   }, []);

   return (
      <header className='bg-[#FAE3B6] border-b-1'>
         <div className="flex px-15 w-full justify-between">
            <div className='flex-[1.5]'>
               <img src={logo.src} alt="Logo"
                  className='w-20 object-cover'
               />
            </div>
            <ul className='flex flex-2 justify-around text-2xl font-normal cursor-pointer'>
               <Link href="/" className='flex items-center border-b-3 border-transparent hover:border-b-3 hover:border-black transition-all duration-100'>
                  Trang chủ
               </Link>
               <li className='flex items-center border-b-3 border-transparent hover:border-b-3 hover:border-black transition-all duration-100'>
                  Phối đồ thông minh
               </li>
               <li className='flex items-center border-b-3 border-transparent hover:border-b-3 hover:border-black transition-all duration-100'>
                  <Dropdown menu={{ items: menuItems }} placement="bottomLeft">
                     <span className='flex items-center h-full'>
                        Danh mục sản phẩm
                        <DownOutlined style={{ fontSize: '0.875rem', marginLeft: '0.5rem' }} />
                     </span>
                  </Dropdown>
               </li>
            </ul>
            <div className='flex flex-[1.5] justify-end items-center gap-5'>
               <div className='relative max-w-md'>
                  <div className='absolute z-30 left-4 top-1/2 -translate-y-1/2 flex items-center'>
                     <SearchOutlined className='text-xl !text-[#FFAF37]' />
                  </div>
                  <Input placeholder="Tìm kiếm sản phẩm"
                     className='text-2xl'
                     size="middle"
                     style={{
                        paddingLeft: '3rem',
                        borderRadius: '9999px',
                        fontSize: '1.25rem',
                     }}
                  />
               </div>
               {user?.role == 'customer' ? (
                  <>
                     <UserOutlined className='text-2xl cursor-pointer' onClick={() => (window.location.href = '/account')} />

                     <div className="relative cursor-pointer" onClick={() => (window.location.href = '/cart')}>
                        <ShoppingCartOutlined className="text-3xl" />

                        {cartCount > 0 && (
                           <span
                              className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold 
                 rounded-full min-w-[20px] h-[20px] flex items-center justify-center 
                 shadow-md border-2 border-white"
                           >
                              {cartCount > 99 ? '99+' : cartCount}
                           </span>
                        )}

                     </div>
                  </>

               ) : (
                  <div className='flex items-center gap-3'>
                     <Link href="/login">
                        <Button style={{ border: '2px solid #000' }} className="w-full !py-2 !px-4 !text-black !hover:text-black !rounded-full !text-xl !bg-transparent" size="large">Đăng nhập</Button>
                     </Link>
                     <Link href="/register">
                        <Button style={{ border: 'none' }} className="w-full !py-2 !px-4 !text-black !hover:text-black !rounded-full !text-xl !bg-[#FFAF37]" size="large">Đăng ký</Button>
                     </Link>
                  </div>
               )}

            </div>
         </div>
      </header>
   )
}

export default HeaderComponent;