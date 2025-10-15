'use client';
import { RightOutlined, PlusOutlined, MinusOutlined, HeartOutlined } from '@ant-design/icons';
import { Button } from "antd";
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/api/instance';

import hinh1 from "@/assets/temImage/pic1.jpg";
import hinh2 from "@/assets/temImage/pic2.jpg";
import hinh3 from "@/assets/temImage/pic3.jpg";
import hinh4 from "@/assets/temImage/pic4.jpg";
import hinh5 from "@/assets/temImage/pic5.jpg";
import PolicyInProductDetail from '@/components/Product/PolicyInProductDetail';
import formatPrice from '@/utils/formatPrice';
import { typeProductColor, typeProductSize } from '@/types/product';
import { messageToast } from '@/helpers/toastHelper';
import { useAuth } from '@/contexts/AuthContext';

function ProductDetailsPage() {
   const { user } = useAuth();
   const router = useRouter();
   const params = useParams();
   const productSlug = params.slug as string;
   const [productDetail, setProductDetail] = useState();
   const [productColor, setProductColor] = useState<typeProductColor[]>([]);
   const [productSize, setProductSize] = useState<typeProductSize[]>([]);
   const [chooseProduct, setChooseProduct] = useState({
      colorId: null,
      sizeCode: null,
      productVariant: null,
      quantity: 1,
   });
   const [errorMessage, setErrorMessage] = useState<string | null>(null);

   const fetchProductDetails = async () => {
      try {
         if (!productSlug) {
            return;
         }
         const response = await api.get(`/product/slug/${productSlug}`);
         if (response.status === 200) {
            console.log(response.data);
            setProductDetail(response.data);
            setProductColor(response.data?.color || []);
            setProductSize(response.data?.sizeDto || []);
            setChooseProduct({ ...chooseProduct, colorId: response.data?.color[0]?.colorId || null });
         }

      } catch (error) {
         console.error('Lỗi khi lấy thông tin chi tiết sản phẩm:', error);
      }
   }

   const productImages = [
      { id: 1, url: hinh1.src },
      { id: 2, url: hinh2.src },
      { id: 3, url: hinh3.src },
      { id: 4, url: hinh4.src },
      { id: 5, url: hinh5.src },
   ];

   const [mainImage, setMainImage] = useState(productImages[0].url);

   const handleImageClick = (imageUrl) => {
      setMainImage(imageUrl);
   };
   const handleChooseColor = (colorId: number) => {
      setChooseProduct(prev => {
         // Nếu chọn lại màu đang chọn, không làm gì cả (hoặc có thể bỏ chọn nếu muốn)
         if (prev.colorId === colorId) {
            return prev;
         }
         // Nếu chọn màu mới, cập nhật colorId và reset sizeCode & productVariant
         return {
            ...prev,
            colorId: colorId,
            sizeCode: null,
            productVariant: null,
            quantity: 1,
         };
      });
   }
   const handleQuantityChange = (type: 'INCREASE' | 'DECREASE') => {
      if (chooseProduct.productVariant) {
         const currentQuantity = chooseProduct.quantity;
         const maxQuantity = chooseProduct.productVariant?.quantity;
         // Tăng/giảm số lượng trong phạm vi từ 1 đến maxQuantity
         if (type === 'INCREASE' && currentQuantity < maxQuantity) {
            setChooseProduct(prev => ({ ...prev, quantity: currentQuantity + 1 }));
         } else if (type === 'DECREASE' && currentQuantity > 1) {
            setChooseProduct(prev => ({ ...prev, quantity: currentQuantity - 1 }));
         }
      }
   }

   const checkIsSizeAvailable = (sizeCode: string) => {
      if (!chooseProduct.colorId) {
         return true;
      }
      // Tìm sản phẩm theo màu đã chọn
      const selectedColorVariant = productDetail?.productColors.find(
         (productColor) => productColor.colorId === chooseProduct.colorId
      );
      const sizeIsAvailable = selectedColorVariant.sizeDto.some(
         (size) => size.sizeCode === sizeCode
      );
      const variant = selectedColorVariant.productVariants.find(
        (v) => v.sizeDto.sizeCode === sizeCode
    );
      if (sizeIsAvailable) {
         return {
            isSupported: true,
            isAvailable: variant.quantity > 0
         };
      } else {
         // Size không được hỗ trợ bởi biến thể màu đã chọn.
         return { isSupported: false, isAvailable: false };
      }
   }

   const handleAddToCart = async () => {
      if (!chooseProduct.sizeCode) {
         setErrorMessage('Vui lòng chọn size trước khi thêm vào giỏ hàng');
         return;
      }

      setErrorMessage(null);

      if (user?.role === 'guest') {
         messageToast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
         router.push("/login");
         return;
      }

      try {
         const payload = {
            productVariantId: chooseProduct.productVariant?.productVariantId,
            quantity: chooseProduct.quantity,
         };
         const response = await api.post('/cartItem', payload);
         if (response.status === 201) {
            console.log('response.data', response.data);
            messageToast.success('Thêm vào giỏ hàng thành công');
            window.dispatchEvent(new Event("cart-updated"));
         }
      } catch (error) {
         console.error('Lỗi khi thêm vào giỏ hàng:', error);
         messageToast.error('Thêm vào giỏ hàng thất bại');
      }
   };

   const handleBuyNow = async () => {
      if (!chooseProduct.sizeCode) {
         setErrorMessage('Vui lòng chọn size trước khi mua hàng');
         return;
      }

      setErrorMessage(null);
      if (user?.role === 'guest') {
         messageToast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
         router.push("/login");
         return;
      }

      sessionStorage.setItem("checkoutCartIds", JSON.stringify([]));
      try {
         const payload = {
            productVariantId: chooseProduct.productVariant?.productVariantId,
            quantity: chooseProduct.quantity,
         };
         const response = await api.post('/cartItem', payload);
         if (response.status === 201) {

            sessionStorage.setItem(
               "checkoutCartIds",
               JSON.stringify([response.data.data.cartId])
            );
            router.push('/checkout');
            window.dispatchEvent(new Event("cart-updated"));
         }
      } catch (error) {
         console.error('Lỗi khi mua ngay sản phẩm:', error);
         messageToast.error('Mua ngay sản phẩm thất bại');
      }
   };

   useEffect(() => {
      fetchProductDetails();
   }, [productSlug]);

   useEffect(() => {
      if (chooseProduct.colorId && chooseProduct.sizeCode && productDetail?.productColors) {
         // 1. Tìm biến thể màu (productColor) dựa trên colorId
         const selectedColorVariant = productDetail.productColors.find(
            (productColor) => productColor.colorId === chooseProduct.colorId
         );

         if (selectedColorVariant) {
            // Tìm biến thể sản phẩm (productVariant) dựa trên sizeCode
            const variant = selectedColorVariant.productVariants.find(
               (v) => v.sizeDto.sizeCode === chooseProduct.sizeCode
            );

            // Cập nhật variant vào state, chỉ khi nó khác với cái cũ
            if (variant !== chooseProduct.productVariant) {
               setChooseProduct(prev => ({ ...prev, productVariant: variant }));
            }
         } else {
            if (chooseProduct.productVariant) {
               setChooseProduct(prev => ({ ...prev, productVariant: null }));
            }
         }
      } else if (chooseProduct.productVariant) {
         // Reset variant nếu chưa chọn đủ (hoặc khi reset size/color)
         setChooseProduct(prev => ({ ...prev, productVariant: null }));
      }

   }, [chooseProduct.colorId, chooseProduct.sizeCode, productDetail]);

   console.log('chooseProduct', chooseProduct);

   return (
      <>
         <div className='bg-[#f9f9f9]'>
            <div className="flex gap-7 w-[65%] mx-auto pt-20 items-start">
               {/* Bên trái */}
               <div className="flex gap-6 flex-1">
                  <div className="aspect-[4/5] overflow-hidden flex-1">
                     <img src={mainImage} alt="Ảnh sản phẩm" className="w-full h-full object-cover rounded-xl" />
                  </div>
                  <div className="max-h-[564px] overflow-hidden">
                     {/* <div className="flex flex-col h-[120px]"> */}
                     <Swiper
                        direction={'vertical'}
                        slidesPerView={4}
                        spaceBetween={15}
                        className="h-full"
                     >
                        {
                           productImages.map((image) => {
                              return (
                                 <SwiperSlide key={image.id}>
                                    <div className="mb-5 w-[88px] h-[120px] cursor-pointer" onClick={() => handleImageClick(image.url)}>
                                       <img src={image.url} alt="Ảnh sản phẩm"
                                          className={`${image.url == mainImage ? 'border-2' : ''} hover:border-2 w-[88px] h-[120px] object-cover rounded-xl`} style={{ aspectRatio: '88 / 120' }} />
                                    </div>
                                 </SwiperSlide>
                              )
                           })
                        }
                     </Swiper>
                     {/* </div> */}
                  </div>
               </div>
               {/* Bên phải */}
               <div className="flex-1 flex flex-col">
                  <h1 className="line-clamp-3 text-2xl font-bold">
                     {productDetail?.productName}
                  </h1>
                  <p className="line-clamp-2 text-lg font-normal mt-3 text-gray-600">
                     MSP: 68250622403DF1261PI
                  </p>
                  <p className="text-2xl font-bold mt-3">
                     {formatPrice(Number(productDetail?.price))}đ
                  </p>
                  <div className="flex mt-3 gap-5">
                     <span className="font-bold text-xl">Màu sắc:</span>
                     <span className="font-normal text-xl">Nâu</span>
                  </div>
                  <div>
                     <div className="flex gap-3">
                        {
                           productColor.map((color) => {
                              return (
                                 <div key={color.colorId} onClick={() => handleChooseColor(color.colorId)} className={`${chooseProduct.colorId == color.colorId ? 'border-2' : 'border-[#e3ddbb]'} w-8 h-8 rounded-full border-1 cursor-pointer flex justify-center items-center`}>
                                    <div
                                       className="w-[80%] h-[80%] rounded-full border-1 border-[#e3ddbb]"
                                       style={{
                                          backgroundColor: color.hexCode,
                                       }}
                                    ></div>
                                 </div>
                              )
                           })
                        }
                     </div>
                  </div>
                  <div className="mt-3">
                     <p className="font-bold text-xl">Kích thước</p>
                     <div className="flex gap-3">
                        {
                           // isSupported: có hỗ trợ size đó không
                           // isAvailable: size đó có còn hàng hay không
                           productSize?.map((size) => {
                              const { isSupported, isAvailable } = checkIsSizeAvailable(size.sizeCode);
                              const isSelected = chooseProduct.sizeCode === size.sizeCode;
                              // Nếu không được hỗ trợ, ẩn nó đi
                              const supportedClasses = !isSupported ? 'hidden' : 'cursor-pointer';
                              let stylingClasses = '';
                              if (isSupported) {
                                 if (!isAvailable) {
                                    // Nếu được hỗ trợ nhưng hết hàng -> Làm mờ và không cho click
                                    stylingClasses = 'opacity-50 !cursor-not-allowed';
                                 } else if (isSelected) {
                                    // Nếu có hàng và được chọn
                                    stylingClasses = 'border-2 border-black';
                                 } else {
                                    // Nếu có hàng và chưa được chọn
                                    stylingClasses = 'border-[#e3ddbb]';
                                 }
                              }
                              // Class Disabled: Áp dụng khi size KHÔNG khả dụng
                              const disabledClasses = !isSupported ? 'hidden' : 'cursor-pointer';
                              // Class Available: Áp dụng khi size CÓ khả dụng và còn hàng
                              const availableClasses = isSupported && isAvailable ? '' : 'cursor-not-allowed opacity-50';
                              // Class Selected: Áp dụng khi size ĐƯỢC CHỌN VÀ KHẢ DỤNG
                              const selectedClasses = isSelected && isSupported && isAvailable ? 'border-2 border-black' : 'border-[#e3ddbb]';
                              return (
                                 <div key={size.sizeId} onClick={() => {
                                    if (isAvailable) {
                                       setChooseProduct({ ...chooseProduct, sizeCode: size.sizeCode, quantity: 1 });
                                    }
                                 }} className={`bg-white rounded-lg border-1 px-3 ${stylingClasses} ${supportedClasses}`}>
                                    <span className="text-lg">{size.sizeCode}</span>
                                 </div>
                              )
                           })
                        }
                     </div>
                     {errorMessage && (
                        <div className="mt-3 bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-sm transition-all duration-300">
                           {errorMessage}
                        </div>
                     )}
                  </div>
                  <div className="flex gap-2 mt-3 items-center">
                     <p className='text-xl font-normal underline cursor-pointer'>
                        Hướng dẫn chọn kích thước
                     </p>
                     <RightOutlined />
                  </div>
                  <div className='mt-3 flex items-center gap-4'>
                     <span className='text-xl font-normal'>Số lượng</span>
                     <div className='flex gap-1'>
                        <Button onClick={() => handleQuantityChange('DECREASE')} style={{ border: 'none' }} disabled={chooseProduct.quantity === 1}><MinusOutlined /></Button>
                        <div className='rounded-full border-1 px-5 flex justify-center items-center min-w-[60px]'>
                           {chooseProduct.quantity}
                        </div>
                        <Button onClick={() => handleQuantityChange('INCREASE')} style={{ border: 'none' }} disabled={chooseProduct.quantity === chooseProduct.productVariant?.quantity || !chooseProduct.sizeCode}><PlusOutlined /></Button>
                     </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                     <Button
                        style={{ fontWeight: '500', border: '1.5px solid #d4d4d4' }}
                        className="!flex-1 !h-12 !bg-white !text-black !rounded-xl !text-base hover:!border-black hover:!bg-gray-50 transition-all"
                        size="large"
                        onClick={handleAddToCart}
                     >
                        Thêm vào giỏ
                     </Button>

                     <Button
                        style={{ fontWeight: '500', backgroundColor: '#FAE3B6', border: 'none' }}
                        className="!flex-1 !h-12 !text-black !rounded-xl !text-base hover:!bg-[#f5d89f] transition-colors"
                        size="large"
                        onClick={handleBuyNow}
                     >
                        Mua ngay
                     </Button>
                  </div>

                  {/* Secondary Action - Virtual Try-on */}
                  <div className="mt-3">
                     <Button
                        onClick={() => {
                           router.push('/try-on')
                           // console.log('productDetail', productDetail);
                           sessionStorage.setItem("product_id", productDetail?.productId);
                        }}
                        className="w-full !h-12 px-3 py-2 !rounded-xl !text-base !font-medium
                     !bg-gradient-to-r !from-teal-400 !to-blue-500
                     hover:!from-teal-500 hover:!to-blue-600
                     !text-white !border-none !shadow-sm hover:!shadow-md
                     transition-all duration-300"
                     >
                        <span className="mr-2">✨</span>
                        Thử đồ ảo ngay
                     </Button>
                  </div>


                  <div className='border-[0.5px] border-[#e3ddbb] mt-5'></div>
                  <p className='my-5 font-normal text-lg line-clamp-5'>
                     {productDetail?.description}
                  </p>
               </div>

            </div>
            <div className='flex gap-3 w-[65%] mx-auto items-center py-5'>
               <div className="cursor-pointer rounded-full bg-white text-xl w-10 h-10 flex justify-center items-center">
                  <HeartOutlined />
               </div>
               <p className='font-normal text-lg text-black'>Thêm vào danh sách yêu thích</p>
            </div>
         </div >
         <PolicyInProductDetail />
      </>
   );
}
export default ProductDetailsPage;