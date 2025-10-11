'use client';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useRef } from 'react';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';

import ProductItemHome from '../Product/ProductItemHome';

function HomeRecommendSection() {
   const product = [1, 2, 3, 4, 5];
   const prevRef = useRef(null);
   const nextRef = useRef(null);

   return (
      <div className="w-[80%] mx-auto pb-20">
         <div className="bg-white p-10 rounded-2xl" style={{ boxShadow: '0px 0px 24px rgba(0, 0, 0, 0.1)' }}>
            <h1 className="text-2xl font-normal text-gray-600 mb-5 text-center uppercase">
               Gợi ý dành cho bạn
            </h1>
            <div className="relative">
               <button
                  ref={prevRef}
                  className={`absolute -left-5 rounded-2xl top-1/2 -translate-y-1/2 z-10 w-10 h-10 border-2 flex items-center justify-center text-black cursor-pointer ${product.length <= 4 ? 'hidden' : ''}`}
               >
                  <LeftOutlined className='text-2xl' />
               </button>
               <button
                  ref={nextRef}
                  className={`absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 border-2 rounded-2xl flex items-center justify-center text-black cursor-pointer ${product.length <= 4 ? 'hidden' : ''}`}
               >
                  <RightOutlined className='text-2xl' />
               </button>
               <Swiper modules={[Navigation, Pagination]} slidesPerView={4} spaceBetween={30} loop={true}
                  navigation={product.length > 4}
                  onBeforeInit={(swiper) => {
                     swiper.params.navigation.prevEl = prevRef.current;
                     swiper.params.navigation.nextEl = nextRef.current;
                  }}
               >
                  {
                     product.map((item, index) => {
                        return (
                           <SwiperSlide key={index}>
                              {/* <ProductItemHome /> */}
                           </SwiperSlide>
                        )
                     })
                  }
               </Swiper>
            </div>
         </div>
      </div>
   );
}

export default HomeRecommendSection;