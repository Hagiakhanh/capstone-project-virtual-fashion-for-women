'use client';
import { Button } from "antd";
import { ArrowRightOutlined } from '@ant-design/icons';
import Link from "next/link";

import ProductItemHome from "../Product/ProductItemHome";
import { useEffect, useState } from "react";
import { api } from "@/api/instance";
import LoadingOverlay from "../Loading/LoadingOverlay";
import { useRouter } from "next/navigation";

function HomeProductSection() {
   const [activeTab, setActiveTab] = useState<number>(2);
   const [products, setProducts] = useState<any[]>([]);
   const [loadingAddToCart, setLoadingAddToCart] = useState<boolean>(false);
   const router = useRouter();

   const fetchProducts = async () => {
      try {
         const response = await api.get('/product/search', {
            params: {
               PageIndex: 1,
               PageSize: 8,
               ProductSort: activeTab
            }
         });
         if (response.status === 200) {
            setProducts(response.data);
         } else {
            setProducts([]);
         }
      } catch (error) {
         console.error("Lỗi khi lấy sản phẩm:", error);
      }
   }

   const handleProductChange = () => {
      fetchProducts();
   };

   useEffect(() => {
      fetchProducts();
   }, [activeTab]);

   return (
      <div className="w-full md:w-[90%] lg:w-[80%] mx-auto py-10 md:py-16 lg:py-20 px-4 md:px-0">
         {loadingAddToCart && <LoadingOverlay size={60} />}
         <div className="bg-white p-4 md:p-8 lg:p-10 rounded-xl md:rounded-2xl" style={{ boxShadow: '0px 0px 24px rgba(0, 0, 0, 0.1)' }}>
            <div className="flex uppercase justify-center gap-4 md:gap-12 lg:gap-20 text-sm md:text-xl lg:text-2xl font-normal text-gray-600 mb-5 md:mb-8">
               <h1 onClick={() => setActiveTab(2)} className={`relative group cursor-pointer ${activeTab === 2 ? 'font-bold text-black' : ''}`}>
                  <span className="hidden md:inline">Hàng mới</span>
                  <span className="md:hidden">Mới</span>
                  <span className={`${activeTab === 2 ? 'w-full' : ''} absolute -bottom-1.5 left-0 h-[2px] md:h-[3px] w-0 bg-black transition-all duration-200 ease-out group-hover:w-full`}></span>
               </h1>
               <h1 onClick={() => setActiveTab(3)} className={`relative group cursor-pointer ${activeTab === 3 ? 'font-bold text-black' : ''}`}>
                  <span className="hidden md:inline">Bán chạy nhất</span>
                  <span className="md:hidden">Bán chạy</span>
                  <span className={`${activeTab === 3 ? 'w-full' : ''} absolute -bottom-1.5 left-0 h-[2px] md:h-[3px] w-0 bg-black transition-all duration-200 ease-out group-hover:w-full`}></span>
               </h1>
               <h1 onClick={() => setActiveTab(4)} className={`relative group cursor-pointer ${activeTab === 4 ? 'font-bold text-black' : ''}`}>
                  <span className="hidden md:inline">Đang giảm giá</span>
                  <span className="md:hidden">Giảm giá</span>
                  <span className={`${activeTab === 4 ? 'w-full' : ''} absolute -bottom-1.5 left-0 h-[2px] md:h-[3px] w-0 bg-black transition-all duration-200 ease-out group-hover:w-full`}></span>
               </h1>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-10">
               {/* Product List Here */}
               {
                  products.map((product) => (
                     <ProductItemHome onWishlistSuccess={handleProductChange} product={product} key={product.productId} setLoading={setLoadingAddToCart} />
                  ))
               }
            </div>
            <div className="flex justify-center mt-6 md:mt-8">
               <Button style={{ fontSize: '1.25rem', border: '1px solid' }}
                  className="mt-2 w-full md:w-auto md:min-w-[20rem] !py-3 md:!py-4 !text-black !hover:text-black !rounded-xl md:!rounded-2xl !text-base md:!text-lg" size="large"
                  onClick={() => router.push('/products')}
               >
                  <div className="flex items-center justify-center gap-3">
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