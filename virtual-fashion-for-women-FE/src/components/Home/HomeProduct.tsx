'use client';
import { Button } from "antd";
import { ArrowRightOutlined } from '@ant-design/icons';

import ProductItemHome from "../Product/ProductItemHome";
import { useState } from "react";

function HomeProductSection() {
   const [activeTab, setActiveTab] = useState<number>(0);

   return (
      <div className="w-[80%] mx-auto py-20">
         <div className="bg-white p-10 rounded-2xl" style={{ boxShadow: '0px 0px 24px rgba(0, 0, 0, 0.1)' }}>
            <div className="flex uppercase justify-center gap-20 text-2xl font-normal text-gray-600 mb-5">
               <h1 onClick={() => setActiveTab(0)} className={`relative group cursor-pointer ${activeTab === 0 ? 'font-bold text-black' : ''}`}>
                  Hàng mới
                  <span className={`${activeTab === 0 ? 'w-full' : ''} absolute -bottom-1.5 left-0 h-[3px] w-0 bg-black transition-all duration-200 ease-out group-hover:w-full`}></span>
               </h1>
               <h1 onClick={() => setActiveTab(1)} className={`relative group cursor-pointer ${activeTab === 1 ? 'font-bold text-black' : ''}`}>
                  Bán chạy nhất
                  <span className={`${activeTab === 1 ? 'w-full' : ''} absolute -bottom-1.5 left-0 h-[3px] w-0 bg-black transition-all duration-200 ease-out group-hover:w-full`}></span>
               </h1>
               <h1 onClick={() => setActiveTab(2)} className={`relative group cursor-pointer ${activeTab === 2 ? 'font-bold text-black' : ''}`}>
                  Đang giảm giá
                  <span className={`${activeTab === 2 ? 'w-full' : ''} absolute -bottom-1.5 left-0 h-[3px] w-0 bg-black transition-all duration-200 ease-out group-hover:w-full`}></span>
               </h1>
            </div>
            <div className="grid grid-cols-4 gap-10">
               {/* Product List Here */}
               <ProductItemHome />
               <ProductItemHome />
               <ProductItemHome />
               <ProductItemHome />
               <ProductItemHome />
            </div>
            <div className="flex justify-center mt-8">
               <Button style={{ fontSize: '1.25rem', border: '1px solid' }}
                  className="mt-2 min-w-[20rem] !py-4 !text-black !hover:text-black !rounded-2xl !text-lg" size="large" >
                  <div className="flex items-center gap-3">
                     <h1>Xem tất cả</h1>
                     <ArrowRightOutlined />
                  </div>
               </Button>
            </div>
         </div>
      </div >
   )
}

export default HomeProductSection;