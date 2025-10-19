import { api } from '@/api/instance';
import { messageToast } from '@/helpers/toastHelper';
import formatPrice from '@/utils/formatPrice';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { Button } from "antd";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from 'react';

function ProductItemHome({ product, onWishlistSuccess }: { product?: any, onWishlistSuccess: () => void }) {
   const isWishlisted = product?.isInWishlist || false;
   const [wishlist, setWishlist] = useState<boolean>(product?.isInWishlist);
   const [selectedHex, setSelectedHex] = useState<string | null>(null);
   const [imageForColor, setImageForColor] = useState<string | null>(null);

   const handleToggleWishlist = async (e: React.MouseEvent, productId: string) => {
      e.preventDefault();
      e.stopPropagation();
      try {
         if (wishlist == false) {
            // Gọi thêm vào wishlist
            const payload = { productId };
            const response = await api.post('/wishlist', payload);
            if (response.status === 200) {
               messageToast.success("Thêm vào yêu thích thành công.");
               onWishlistSuccess();
            }

         } else if (wishlist == true) {
            // Gọi xóa khỏi wishlist
            const response = await api.delete(`/wishlist/product/${productId}`);
            if (response.status === 200) {
               messageToast.success("Xóa khỏi yêu thích thành công.");
               onWishlistSuccess();
            }
         }

      } catch (error) {
         console.error("Lỗi khi thêm sản phẩm vào danh sách yêu thích:", error);
      }
   };
   const allHexCodes = useMemo(() => {
      return product?.productColors?.map((x: any) => x?.color?.hexCode)
   }, [product?.productColors])

   const handleChooseColor = (e: React.MouseEvent, hexCode: string) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedHex(hexCode);
      const imageForColor = product?.productColors?.find((x: any) => x?.color?.hexCode === hexCode)?.productImagesDto[0]?.imageUrl || null;
      setImageForColor(imageForColor);
   }

   useEffect(() => {
      setWishlist(product?.isInWishlist);
   }, [product?.isInWishlist]);

   return (
      <Link href={`/products/${product.productSlug}`}>
         <div className="p-[1rem] relative rounded-2xl bg-[#f3f3f3] cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
            {/* Hình ảnh */}
            <div className="flex justify-center aspect-[3/4] overflow-hidden relative">
               <img src={imageForColor ? imageForColor : product?.mainImageUrl} alt={product?.productName} className="w-full h-auto object-cover rounded-2xl" />
               <div onClick={(e) => handleToggleWishlist(e, product?.productId)} className="absolute z-30 top-0 right-0 m-2 p-2 rounded-full bg-white text-xl">
                  {isWishlisted ? <HeartFilled style={{ color: 'red' }} /> : <HeartOutlined />}
               </div>
            </div>

            {/* Nội dung */}
            <div className="flex flex-col mt-5">
               <div className="line-clamp-1">
                  <h2 className="text-lg font-normal">
                     {product?.productName}
                  </h2>
               </div>

               {/* HIỂN THỊ KHỐI MÀU */}
               {allHexCodes && allHexCodes.length > 0 && (
                  <div className="flex gap-2 mt-2 mb-1" onClick={(e) => e.preventDefault()}
                     onMouseDown={(e) => e.stopPropagation()}
                     onTouchStart={(e) => e.stopPropagation()}>
                     {allHexCodes.map((hexCode: string, index: number) => {
                        const isSelected = selectedHex === hexCode;
                        const selectedBorder = isSelected ? 'border' : '';
                        return (
                           <div
                              key={index}
                              onClick={(e) => handleChooseColor(e, hexCode)}
                              className={`${hexCode == selectedHex ? 'border-2 border-black ' : ''} w-5 h-5 rounded-full shadow-sm`}
                              style={{
                                 backgroundColor: hexCode,
                              }}
                              title={`Mã màu: ${hexCode}`}
                           ></div>
                        )
                     })}
                  </div>
               )}

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