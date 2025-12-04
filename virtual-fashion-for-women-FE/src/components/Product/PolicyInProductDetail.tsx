import step1 from '../../assets/product/step1.svg';
import step2 from '../../assets/product/step2.svg';
import step3 from '../../assets/product/step3.svg';
import step4 from '../../assets/product/step4.svg';
import step5 from '../../assets/product/step5.svg';
import policy from '../../assets/product/policy.png';
import policy1 from '../../assets/product/policy1.svg';
import policy2 from '../../assets/product/policy2.svg';
import policy3 from '../../assets/product/policy3.svg';
import policy4 from '../../assets/product/policy4.svg';

function PolicyInProductDetail() {
   return (
      <div className="w-full md:w-[80%] lg:w-[65%] mx-auto py-6 md:py-8 lg:py-10 bg-[#ffffff] px-4 md:px-0">
         <div className="inline-block">
            <h1 className="font-bold text-lg md:text-xl">Thông tin bổ sung</h1>
            <span className="h-[2px] md:h-[3px] bg-black w-full flex mt-1.5 md:mt-2"></span>
         </div>

         {/* Lưu ý về Màu và Size */}
         <div className="mt-6 md:mt-8 lg:mt-10">
            <div className="mb-2 md:mb-3 flex items-center gap-2 md:gap-3">
               <svg viewBox="0 0 64 71" className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 flex-shrink-0" fill="none">
                  <path stroke="#000" strokeLinecap="round" strokeWidth="2.944" d="M27.63 63.018H8.164v0a5.855 5.855 0 0 1-5.855-5.856v-45.41a5.855 5.855 0 0 1 5.855-5.855v0h39.683a5.104 5.104 0 0 1 5.104 5.104v23.457"></path>
                  <path stroke="#000" strokeLinejoin="round" strokeWidth="2.944" d="M50.13 42.877 33.354 57.964l-1.251 8.724 9.02-.513 16.775-15.087m-7.768-8.211 3.766-3.387s3.03 1.862 4.569 3.49 3.199 4.722 3.199 4.722l-3.766 3.386m-7.768-8.211 3.884 4.105 3.884 4.106"></path>
                  <path stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.944" d="M11.12 18.456h34.176M11.12 29.178h34.176M11.12 40.445h26.578"></path>
               </svg>
               <p className="font-bold text-base md:text-xl lg:text-2xl text-black">Lưu ý về Màu và Size</p>
            </div>
            <ul className="font-normal text-sm md:text-base lg:text-lg list-disc list-inside space-y-1 md:space-y-2">
               <li>Bảng size chỉ mang tính chất tham khảo, tùy thuộc vào số đo cơ thể mỗi người và chất liệu vải sẽ có sự chênh lệch nhất định.</li>
               <li>Màu sắc vải/sản phẩm có thể chênh lệch so với thực tế do ảnh hưởng về độ lệch màu của ánh sáng, góc chụp nhưng vẫn đảm bảo chất lượng.</li>
            </ul>
         </div>

         {/* Hướng dẫn bảo quản */}
         <div className="mt-6 md:mt-8 lg:mt-10">
            <div className="mb-3 md:mb-4 lg:mb-5 flex items-center gap-2 md:gap-3">
               <svg viewBox="0 0 64 61" className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 flex-shrink-0" fill="none">
                  <path stroke="#000" strokeLinecap="round" strokeWidth="2.944" d="M25.569 59.478H10.553v0a8.244 8.244 0 0 1-8.244-8.245V10.602a8.244 8.244 0 0 1 8.244-8.245v0h37.982c.162 0 .294.132.294.295v28.266"></path>
                  <path stroke="#000" strokeWidth="2.944" d="M14.38 43.873V2.652"></path>
                  <path fill="#000" d="M10.553 50.35a1.472 1.472 0 1 0 0 2.944zm0 2.944h25.91V50.35h-25.91z"></path>
                  <path stroke="#000" strokeLinecap="round" strokeWidth="2.944" d="M24.686 11.19h15.31M22.33 18.846h20.022"></path>
                  <rect width="54.176" height="15.899" x="2.309" y="43.578" stroke="#000" strokeWidth="2.944" rx="7.95"></rect>
                  <circle cx="48.829" cy="45.934" r="13.544" fill="#fff" stroke="#000" strokeWidth="2.944"></circle>
                  <path stroke="#000" strokeLinecap="round" strokeWidth="2.944" d="M48.83 44.756V53M48.83 38.867v.59"></path>
               </svg>
               <p className="font-bold text-base md:text-xl lg:text-2xl text-black">Hướng dẫn bảo quản</p>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6'>
               <div className='flex flex-col items-center gap-2'>
                  <img src={step1.src} alt="step1" className='w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain' />
                  <span className='text-xs md:text-sm lg:text-[15px] text-black text-center'>Nên giặt tay với nước ấm ở nhiệt độ 30 độ C</span>
               </div>
               <div className='flex flex-col items-center gap-2'>
                  <img src={step2.src} alt="step2" className='w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain' />
                  <span className='text-xs md:text-sm lg:text-[15px] text-black text-center'>Sử dụng túi giặt khi giặt máy</span>
               </div>
               <div className='flex flex-col items-center gap-2'>
                  <img src={step3.src} alt="step3" className='w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain' />
                  <span className='text-xs md:text-sm lg:text-[15px] text-black text-center'>Giặt riêng với quần áo khác màu</span>
               </div>
               <div className='flex flex-col items-center gap-2'>
                  <img src={step4.src} alt="step4" className='w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain' />
                  <span className='text-xs md:text-sm lg:text-[15px] text-black text-center'>Tránh phơi nắng gắt</span>
               </div>
               <div className='flex flex-col items-center gap-2 col-span-2 md:col-span-1'>
                  <img src={step5.src} alt="step5" className='w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain' />
                  <span className='text-xs md:text-sm lg:text-[15px] text-black text-center'>Ủi với nhiệt độ thích hợp, không ủi lên hình in</span>
               </div>
            </div>
         </div>

         {/* Chính sách mua hàng */}
         <div className="mt-6 md:mt-8 lg:mt-10">
            <div className="mb-3 md:mb-4 lg:mb-5 flex items-center gap-2 md:gap-3">
               <img src={policy.src} alt="policy" className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 object-contain flex-shrink-0" />
               <p className="font-bold text-base md:text-xl lg:text-2xl text-black">Chính sách mua hàng</p>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6'>
               <div className='flex flex-col items-center gap-2'>
                  <img src={policy1.src} alt="policy1" className='w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain' />
                  <span className='text-xs md:text-sm lg:text-[15px] text-black text-center'>Quay lại video trong quá trình khui hàng</span>
               </div>
               <div className='flex flex-col items-center gap-2'>
                  <img src={policy2.src} alt="policy2" className='w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain' />
                  <span className='text-xs md:text-sm lg:text-[15px] text-black text-center'>Có hỗ trợ đổi trả lại hàng</span>
               </div>
               <div className='flex flex-col items-center gap-2'>
                  <img src={policy3.src} alt="policy3" className='w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain' />
                  <span className='text-xs md:text-sm lg:text-[15px] text-black text-center'>Hỗ trợ trả hàng trong vòng 3 ngày</span>
               </div>
               <div className='flex flex-col items-center gap-2'>
                  <img src={policy4.src} alt="policy4" className='w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 object-contain' />
                  <span className='text-xs md:text-sm lg:text-[15px] text-black text-center'>Sản phẩm trả phải còn nguyên vẹn, còn tem mác</span>
               </div>
            </div>
         </div>
      </div>
   )
}

export default PolicyInProductDetail;