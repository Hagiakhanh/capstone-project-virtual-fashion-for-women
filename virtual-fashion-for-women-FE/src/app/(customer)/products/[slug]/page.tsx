'use client';
import { RightOutlined, PlusOutlined, MinusOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { Button } from "antd";
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/api/instance';

import PolicyInProductDetail from '@/components/Product/PolicyInProductDetail';
import formatPrice from '@/utils/formatPrice';
import { typeProductColor, typeProductSize } from '@/types/product';
import { messageToast } from '@/helpers/toastHelper';
import { useAuth } from '@/contexts/AuthContext';
import QRCode from 'qrcode'
import { set } from 'lodash';
import ProductRatings from '@/components/Rating/ProductRatings';
import SizeGuideModal from '@/components/Size/SizeGuideModal';

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
   const [selectedColorVariant, setSelectedColorVariant] = useState(null);
   const [errorMessage, setErrorMessage] = useState<string | null>(null);
   const [colorImages, setColorImages] = useState([]);
   const [mainImage, setMainImage] = useState(null);
   const [lensID, setLensID] = useState<string>('');
   const [linkToArTryOn, setLinkToArTryOn] = useState<string>('');
   const [wishlist, setWishlist] = useState<boolean>(false);
   const [sizeTable, setSizeTable] = useState(null);
   const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

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
            const selectedColorVariant = response.data.productColors.find(
               (productColor) => productColor.colorId === response.data?.color[0]?.colorId
            );
            setLensID(selectedColorVariant?.lensId);
            if (selectedColorVariant?.lensId) {
               QRCode.toDataURL(`${window.location.origin}/ar-try-on/${selectedColorVariant.lensId}`).then(setLinkToArTryOn);
            }
            setSelectedColorVariant(selectedColorVariant || null);
            setColorImages(selectedColorVariant?.productImagesDto || [])
            setMainImage(selectedColorVariant?.productImagesDto[0]?.imageUrl || null);
            setWishlist(response.data?.isInWishlist);
         }

      } catch (error) {
         console.error('Lỗi khi lấy thông tin chi tiết sản phẩm:', error);
      }
   }

   const handleImageClick = (imageUrl) => {
      setMainImage(imageUrl);
   };
   const handleChooseColor = (colorId: number) => {
      const selectedColorVariant = productDetail.productColors.find(
         (productColor) => productColor.colorId === colorId
      );
      setLensID(selectedColorVariant?.lensId);
      if (selectedColorVariant?.lensId) {
         QRCode.toDataURL(`${window.location.origin}/ar-try-on`).then(setLinkToArTryOn);
      }
      setSelectedColorVariant(selectedColorVariant || null);
      setColorImages(selectedColorVariant?.productImagesDto || [])
      setMainImage(selectedColorVariant?.productImagesDto[0]?.imageUrl || null);
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

   const handleToggleWishlist = async (productId: string) => {
      if (user?.role === 'guest') {
         messageToast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
         return;
      }
      try {
         if (!wishlist) {
            const response = await api.post('/wishlist', { productId });
            if (response.status === 200) {
               messageToast.success("Thêm vào yêu thích thành công.");
               fetchProductDetails();
            }
         } else {
            const response = await api.delete(`/wishlist/product/${productId}`);
            if (response.status === 200) {
               messageToast.success("Xóa khỏi yêu thích thành công.");
               fetchProductDetails();
            }
         }
      } catch (error) {
         console.error("Lỗi khi thêm sản phẩm vào danh sách yêu thích:", error);
      }
   };

   const fetchSizeTable = async () => {
      if (!productDetail?.categoryId) return;
      try {
         const response = await api.get(
            `categorysizetemplate/by-categoryid/${productDetail?.categoryId}`
         );
         if (response.status === 200) {
            setSizeTable(response?.data);
         }
      } catch (error) {
         console.error('Lỗi khi lấy bảng size sản phẩm:', error);
      }
   }

   useEffect(() => {
      fetchSizeTable();
   }, [productDetail]);

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

   // console.log('chooseProduct', chooseProduct);

   const displayPrice = productDetail?.priceAtTime || productDetail?.price;
   const hasDiscount = productDetail?.priceAtTime < productDetail?.price;

   return (
      <>
         <div className='bg-[#f9f9f9]'>
            <div className="flex gap-7 lg:w-[65%] w-full mx-auto pt-6 lg:pt-20 px-4 lg:px-0 flex-col lg:flex-row items-start">
               {/* Bên trái - Hình ảnh */}
               <div className='flex-1 w-full lg:w-auto'>
                  <div className="flex gap-3 lg:gap-6 flex-col lg:flex-row">
                     <div className="aspect-[4/5] overflow-hidden flex-1 w-full">
                        <img src={mainImage} alt="Ảnh sản phẩm" className="w-full h-full object-cover rounded-xl" />
                     </div>
                     <div className="max-h-[564px] overflow-hidden hidden lg:block lg:max-w-[88px]">
                        <Swiper
                           direction={'vertical'}
                           slidesPerView={4}
                           spaceBetween={15}
                           className="h-full"
                        >
                           {
                              colorImages?.map((image) => {
                                 return (
                                    <SwiperSlide key={image.id}>
                                       <div className="mb-5 w-[88px] h-[120px] cursor-pointer" onClick={() => handleImageClick(image.imageUrl)}>
                                          <img src={image.imageUrl} alt="Ảnh sản phẩm"
                                             className={`${image.imageUrl == mainImage ? 'border-2' : ''} hover:border-2 w-[88px] h-[120px] object-cover rounded-xl`} style={{ aspectRatio: '88 / 120' }} />
                                       </div>
                                    </SwiperSlide>
                                 )
                              })
                           }
                        </Swiper>
                     </div>
                  </div>

                  {/* Mobile thumbnail slider */}
                  <div className="lg:hidden max-h-[120px] overflow-hidden mt-3">
                     <Swiper
                        direction={'horizontal'}
                        slidesPerView={4}
                        spaceBetween={10}
                        className="w-full"
                     >
                        {
                           colorImages?.map((image) => {
                              return (
                                 <SwiperSlide key={image.id}>
                                    <div className="w-[70px] h-[90px] cursor-pointer" onClick={() => handleImageClick(image.imageUrl)}>
                                       <img src={image.imageUrl} alt="Ảnh sản phẩm"
                                          className={`${image.imageUrl == mainImage ? 'border-2' : ''} hover:border-2 w-[70px] h-[90px] object-cover rounded-xl`} style={{ aspectRatio: '70 / 90' }} />
                                    </div>
                                 </SwiperSlide>
                              )
                           })
                        }
                     </Swiper>
                  </div>

                  <div className='flex gap-3 items-center py-3 lg:py-5 lg:w-[65%] w-full'>
                     <div className="cursor-pointer rounded-full bg-white text-xl w-10 h-10 flex justify-center items-center shadow-sm"
                        onClick={() => handleToggleWishlist(productDetail?.productId)}
                     >
                        {wishlist ? <HeartFilled style={{ color: 'red' }} /> : <HeartOutlined />}
                     </div>
                     <p className='font-normal text-base lg:text-lg text-black'>Thêm vào danh sách yêu thích</p>
                  </div>
               </div>

               {/* Bên phải - Thông tin sản phẩm */}
               <div className="flex-1 w-full lg:w-auto flex flex-col">
                  <h1 className="line-clamp-3 text-xl lg:text-2xl font-bold">
                     {productDetail?.productName}
                  </h1>
                  <p className="line-clamp-2 text-base lg:text-lg font-normal mt-2 lg:mt-3 text-gray-600">
                     MSP: {chooseProduct.productVariant ? chooseProduct.productVariant?.productVariantId : selectedColorVariant?.productColorId}
                  </p>

                  <div className="mt-2 flex gap-2 items-center">
                     <span className={`${hasDiscount == true ? 'text-red-600' : 'text-black'} font-bold text-xl lg:text-2xl`}>
                        {formatPrice(Number(displayPrice))}đ
                     </span>
                     {hasDiscount && (
                        <span className="line-through text-gray-500 text-xs lg:text-sm">
                           {formatPrice(Number(productDetail?.price))}đ
                        </span>
                     )}
                  </div>

                  {/* Màu sắc */}
                  <div className="flex mt-3 gap-3 lg:gap-5 flex-col lg:flex-row items-start lg:items-center">
                     <span className="font-bold text-base lg:text-xl">Màu sắc:</span>
                     <span className="font-normal text-base lg:text-xl">{productColor.find(color => color.colorId === selectedColorVariant?.colorId)?.colorName}</span>
                  </div>
                  <div>
                     <div className="flex gap-2 lg:gap-3 flex-wrap">
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

                  {/* Kích thước */}
                  <div className="mt-3 w-full">
                     <p className="font-bold text-base lg:text-xl">Kích thước</p>
                     <div className="flex gap-2 lg:gap-3 flex-wrap">
                        {
                           productSize?.map((size) => {
                              const { isSupported, isAvailable } = checkIsSizeAvailable(size.sizeCode);
                              const isSelected = chooseProduct.sizeCode === size.sizeCode;
                              const supportedClasses = !isSupported ? 'hidden' : 'cursor-pointer';
                              let stylingClasses = '';
                              if (isSupported) {
                                 if (!isAvailable) {
                                    stylingClasses = 'opacity-50 !cursor-not-allowed';
                                 } else if (isSelected) {
                                    stylingClasses = 'border-2 border-black';
                                 } else {
                                    stylingClasses = 'border-[#e3ddbb]';
                                 }
                              }
                              return (
                                 <div key={size.sizeId} onClick={() => {
                                    if (isAvailable) {
                                       setChooseProduct({ ...chooseProduct, sizeCode: size.sizeCode, quantity: 1 });
                                    }
                                 }} className={`bg-white rounded-lg border-1 px-2 lg:px-3 py-2 lg:py-0 ${stylingClasses} ${supportedClasses}`}>
                                    <span className="text-sm lg:text-lg">{size.sizeCode}</span>
                                 </div>
                              )
                           })
                        }
                     </div>
                     {errorMessage && (
                        <div className="mt-3 bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-sm transition-all duration-300 text-sm lg:text-base">
                           {errorMessage}
                        </div>
                     )}
                  </div>

                  {/* Hướng dẫn chọn kích thước */}
                  <div className="flex gap-2 mt-3 items-center">
                     <p
                        className='text-sm lg:text-xl font-normal underline cursor-pointer hover:text-blue-600 transition-colors'
                        onClick={() => {
                           if (sizeTable && sizeTable?.length > 0) {
                              setIsSizeGuideOpen(true);
                           } else {
                              messageToast.info("Sản phẩm này chưa có bảng size chi tiết.");
                           }
                        }}
                     >
                        Hướng dẫn chọn kích thước
                     </p>
                     <RightOutlined className="text-xs lg:text-sm" />
                  </div>

                  {/* Số lượng */}
                  <div className='mt-3 flex items-center gap-3 lg:gap-4 flex-wrap'>
                     <span className='text-base lg:text-xl font-normal'>Số lượng</span>
                     <div className='flex gap-1'>
                        <Button onClick={() => handleQuantityChange('DECREASE')} style={{ border: 'none' }} disabled={chooseProduct.quantity === 1}><MinusOutlined /></Button>
                        <div className='rounded-full border-1 px-4 lg:px-5 py-2 lg:py-0 flex justify-center items-center min-w-[50px] lg:min-w-[60px]'>
                           {chooseProduct.quantity}
                        </div>
                        <Button onClick={() => handleQuantityChange('INCREASE')} style={{ border: 'none' }} disabled={chooseProduct.quantity === chooseProduct.productVariant?.quantity || !chooseProduct.sizeCode}><PlusOutlined /></Button>
                     </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="flex gap-2 lg:gap-3 mt-4 lg:mt-5 flex-col lg:flex-row w-full">
                     <Button
                        style={{ fontWeight: '500', border: '1.5px solid #d4d4d4' }}
                        className="!flex-1 !h-14 md:!h-14 lg:!h-12 !bg-white !text-black !rounded-xl !text-lg lg:!text-base hover:!border-black hover:!bg-gray-50 transition-all"
                        size="large"
                        onClick={handleAddToCart}
                     >
                        Thêm vào giỏ
                     </Button>

                     <Button
                        style={{ fontWeight: '500', backgroundColor: '#FAE3B6', border: 'none' }}
                        className="!flex-1 !h-14 md:!h-14 lg:!h-12 !text-black !rounded-xl !text-lg lg:!text-base hover:!bg-[#f5d89f] transition-colors"
                        size="large"
                        onClick={handleBuyNow}
                     >
                        Mua ngay
                     </Button>
                  </div>

                  {/* Thử đồ ảo */}
                  <div className="mt-3 flex flex-col items-center text-center space-y-3 lg:space-y-4 w-full">
                     <Button
                        onClick={() => {
                           router.push('/try-on');
                           sessionStorage.setItem("productColor", JSON.stringify(selectedColorVariant?.productColorId));
                        }}
                        className="w-full !h-14 md:!h-14 lg:!h-12 px-3 py-2 !rounded-xl !text-lg md:!text-lg lg:!text-base !font-medium
                    !bg-gradient-to-r !from-teal-400 !to-blue-500
                  hover:!from-teal-500 hover:!to-blue-600
                  !text-white !border-none !shadow-sm hover:!shadow-md
                    transition-all duration-300"
                     >
                        <span className="mr-2">✨</span>
                        Thử đồ ảo ngay
                     </Button>

                     {lensID && (
                        <div className="flex flex-col items-center space-y-2 lg:space-y-3 mt-2 w-full">
                           <div className="flex items-center space-x-2 text-gray-400 text-xs lg:text-sm font-medium w-full">
                              <div className="flex-1 h-[1px] bg-gray-300"></div>
                              <span className="px-2 whitespace-nowrap">Hoặc quét mã QR</span>
                              <div className="flex-1 h-[1px] bg-gray-300"></div>
                           </div>

                           <div className="p-2 lg:p-3 bg-gray-50 rounded-xl border border-gray-200 shadow-inner hover:shadow-md transition-all">
                              <img
                                 src={linkToArTryOn}
                                 alt="QR Code to AR Try-On"
                                 className="w-32 h-32 lg:w-40 lg:h-40 object-contain"
                              />
                           </div>
                        </div>
                     )}
                  </div>

                  <div className='border-[0.5px] border-[#e3ddbb] mt-4 lg:mt-5'></div>
                  <p className='my-3 lg:my-5 font-normal text-sm lg:text-lg line-clamp-5'>
                     {productDetail?.description}
                  </p>
               </div>
            </div>
         </div>

         <PolicyInProductDetail />

         {productDetail && (
            <ProductRatings productId={productDetail?.productId} />
         )}

         <SizeGuideModal
            isOpen={isSizeGuideOpen}
            onClose={() => setIsSizeGuideOpen(false)}
            categoryId={productDetail?.categoryId}
         />
      </>
   );
}
export default ProductDetailsPage;