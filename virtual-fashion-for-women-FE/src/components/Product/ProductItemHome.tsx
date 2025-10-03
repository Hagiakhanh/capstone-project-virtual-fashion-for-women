import { HeartOutlined } from '@ant-design/icons';

import HinhMau from "@/assets/home/HinhMau.jpg";
import { AntButtonCommon } from "@/components/AntDesign/Button/AntButtonCommon";

function ProductItemHome() {
   return (
      <div className="p-[1rem] relative rounded-2xl bg-[#f3f3f3] cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
         {/* Hình ảnh */}
         <div className="flex justify-center aspect-[3/4] overflow-hidden relative">
            <img src={HinhMau.src} alt="Hình mẫu" className="w-full h-auto object-cover rounded-2xl" />
            <div className="absolute top-0 right-0 m-2 p-2 rounded-full bg-white text-xl">
               <HeartOutlined />
            </div>
         </div>

         {/* Nội dung */}
         <div className="flex flex-col mt-5">
            <div className="line-clamp-1">
               <h2 className="text-lg font-normal">
                  Áo kiểu babydoll nữ dáng xòe phối ren THE C.I.U, áo sát nách cổ V phong cách tiểu thư - Naomi Babydoll
               </h2>
            </div>
            <div className="mt-2">
               <span className="font-bold text-lg">365.000đ</span>
            </div>
            <div className="flex flex-col gap-3 mt-3">
               <AntButtonCommon label="Mua ngay" style={{ fontWeight: 'normal', backgroundColor: '#FAE3B6', border: 'none' }} className="w-full !py-4 !text-black !hover:text-black !rounded-2xl !text-lg" size="large" />
               <AntButtonCommon label="Thêm vào giỏ hàng" style={{ fontWeight: 'normal', border: '1px solid' }} className="mt-2 w-full !py-4 !text-black !hover:text-black !rounded-2xl !text-lg" size="large" />
            </div>
         </div>
      </div>
   );
}

export default ProductItemHome;