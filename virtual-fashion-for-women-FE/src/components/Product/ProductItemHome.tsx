import formatPrice from '@/utils/formatPrice';
import { HeartOutlined } from '@ant-design/icons';
import { Button } from "antd";
import Link from "next/link";

function ProductItemHome({ product }: { product?: any }) {
   return (
      <Link href={`/products/${product.productSlug}`}>
         <div className="p-[1rem] relative rounded-2xl bg-[#f3f3f3] cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            {/* Hình ảnh */}
            <div className="flex justify-center aspect-[3/4] overflow-hidden relative">
               <img src={product?.mainImageUrl} alt={product?.productName} className="w-full h-auto object-cover rounded-2xl" />
               <div className="absolute top-0 right-0 m-2 p-2 rounded-full bg-white text-xl">
                  <HeartOutlined />
               </div>
            </div>

            {/* Nội dung */}
            <div className="flex flex-col mt-5">
               <div className="line-clamp-1">
                  <h2 className="text-lg font-normal">
                     {product?.productName}
                  </h2>
               </div>
               <div className="mt-2">
                  <span className="font-bold text-lg">{product?.price ? `${formatPrice(product?.price)}đ` : '0đ'}</span>
               </div>
               <div className="flex flex-col gap-3 mt-3">
                  <Button style={{ fontWeight: 'normal', backgroundColor: '#FAE3B6', border: 'none' }} className="w-full !py-4 !text-black !hover:text-black !rounded-2xl !text-lg" size="large">Mua ngay</Button>
                  <Button style={{ fontWeight: 'normal', border: '1px solid' }} className="mt-2 w-full !py-4 !text-black !hover:text-black !rounded-2xl !text-lg" size="large">Thêm vào giỏ hàng</Button>
               </div>
            </div>
         </div>
      </Link>
   );
}

export default ProductItemHome;