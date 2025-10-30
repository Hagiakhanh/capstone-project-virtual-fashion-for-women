'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useEffect, useRef, useState } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

import ProductItemHome from '../Product/ProductItemHome';
import { api } from '@/api/instance';
import LoadingOverlay from '../Loading/LoadingOverlay';

function HomeRecommendSection() {
   const [products, setProducts] = useState<any[]>([]);
   const [loadingAddToCart, setLoadingAddToCart] = useState<boolean>(false);
   const prevRef = useRef(null);
   const nextRef = useRef(null);

   // Hàm gọi API gợi ý
   const fetchRecommendations = async () => {
      try {
         // Gọi API route của Next.js, không phân trang, dùng topN
         const response = await api.get('/recommendation', {
               params: {
                  topN: 8 // Lấy 8 sản phẩm
               }
         });
         if (response.status === 200) {
               setProducts(response.data);
         } else {
               setProducts([]);
         }
      } catch (error) {
         console.error("Lỗi khi lấy sản phẩm gợi ý:", error);
         setProducts([]);
      }
   }

    // Hàm để gọi lại API khi có thay đổi (vd: thêm/xóa wishlist)
    const handleRecommendationChange = () => {
        fetchRecommendations();
    };

    // Gọi API khi component mount
   useEffect(() => {
      fetchRecommendations();
   }, []);

   return (
      <div className="w-[80%] mx-auto pb-20">
         {loadingAddToCart && <LoadingOverlay size={60} />}
         <div className="bg-white p-10 rounded-2xl" style={{ boxShadow: '0px 0px 24px rgba(0, 0, 0, 0.1)' }}>
            <h1 className="text-2xl font-normal text-gray-600 mb-5 text-center uppercase">
               Gợi ý dành cho bạn
            </h1>
            {products.length > 0 && (
               <div className="relative">
                  <button
                     ref={prevRef}
                     className={`absolute -left-5 rounded-2xl top-1/2 -translate-y-1/2 z-10 w-10 h-10 border-2 flex items-center justify-center text-black cursor-pointer ${products.length <= 4 ? 'hidden' : ''}`}
                  >
                     <LeftOutlined className='text-2xl' />
                  </button>
                  <button
                     ref={nextRef}
                     className={`absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 border-2 rounded-2xl flex items-center justify-center text-black cursor-pointer ${products.length <= 4 ? 'hidden' : ''}`}
                  >
                     <RightOutlined className='text-2xl' />
                  </button>
                  <Swiper modules={[Navigation, Pagination]} slidesPerView={4} spaceBetween={30} loop={products.length > 4}
                     navigation={products.length > 4 ? { // Gán ref cho navigation
                              prevEl: prevRef.current,
                              nextEl: nextRef.current,
                           } : false}
                     onBeforeInit={(swiper) => {
                        if (swiper.params.navigation) {
                           (swiper.params.navigation as any).prevEl = prevRef.current;
                           (swiper.params.navigation as any).nextEl = nextRef.current;
                        }
                     }}
                  >
                     {
                        products.map((product) => {
                           return (
                              <SwiperSlide key={product.productId}>
                                 <ProductItemHome 
                                    onWishlistSuccess={handleRecommendationChange} 
                                    product={product} 
                                    setLoading={setLoadingAddToCart} 
                                 />
                              </SwiperSlide>
                           )
                        })
                     }
                  </Swiper>
               </div>
            )}
         </div>
      </div>
   );
}

export default HomeRecommendSection;