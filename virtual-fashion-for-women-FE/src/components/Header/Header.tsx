'use client';
import { SearchOutlined, UserOutlined, ShoppingCartOutlined, DownOutlined } from '@ant-design/icons';
import { Input, Dropdown } from 'antd';
import type { MenuProps } from 'antd';

import logo from '../../assets/home/Logo.png';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AntButtonCommon } from "@/components/AntDesign/Button/AntButtonCommon";

function HeaderComponent() {
   const { user } = useAuth();

   const items: MenuProps['items'] = [
      { key: '1', label: <span style={{ fontSize: '1rem' }}>Áo</span> },
      { key: '2', label: <span style={{ fontSize: '1rem' }}>Quần</span> },
      { key: '3', label: <span style={{ fontSize: '1rem' }}>Váy</span> },
      { key: '4', label: <span style={{ fontSize: '1rem' }}>Đầm</span> },
   ];

   console.log('Current user in header:', user);

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
                  <Dropdown menu={{ items }} placement="bottomLeft">
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
                     <UserOutlined className='text-2xl cursor-pointer' />
                     <ShoppingCartOutlined className='text-3xl cursor-pointer' />
                  </>
               ) : (
                  <div className='flex items-center gap-3'>
                     <Link href="/login">
                        <AntButtonCommon label="Đăng nhập" style={{ border: '2px solid #000' }} className="w-full !py-2 !px-4 !text-black !hover:text-black !rounded-full !text-xl !bg-transparent" size="large" />
                     </Link>
                     <Link href="/register">
                        <AntButtonCommon label="Đăng ký" style={{ border: 'none' }} className="w-full !py-2 !px-4 !text-black !hover:text-black !rounded-full !text-xl !bg-[#FFAF37]" size="large" />
                     </Link>
                  </div>
               )}

            </div>
         </div>
      </header>
   )
}

export default HeaderComponent;