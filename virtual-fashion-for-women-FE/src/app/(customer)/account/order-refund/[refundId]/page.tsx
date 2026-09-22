'use client';

import { api } from "@/api/instance";
import formatDate from "@/utils/formatDate";
import formatPrice from "@/utils/formatPrice";
import { Calendar, MapPin, Mail, Phone, User, ArrowLeft, Package } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OrderRefundDetailDTO } from "@/models/OrderRefundDTO";
import statusMapRefund from "@/helpers/statusMapperRefund";
import { Modal } from "antd";
import { messageToast } from "@/helpers/toastHelper";
import statusMap from "@/helpers/statusMapper";

export default function RefundDetailsPage() {
   const { refundId } = useParams();
   const [refundDetails, setRefundDetails] = useState<OrderRefundDetailDTO>();
   const [statusOrderInformation, setStatusOrderInformation] = useState<any>();
   const route = useRouter();
   const [previewVisible, setPreviewVisible] = useState(false);
   const [selectedImage, setSelectedImage] = useState<string | null>(null);

   const handlePreview = (img: string) => {
      setSelectedImage(img);
      setPreviewVisible(true);
   };

   const handleClose = () => {
      setPreviewVisible(false);
      setSelectedImage(null);
   };

   const fetchOrderRefundDetails = async () => {
      if (!refundId) {
         return;
      }
      try {
         const response = await api.get(`/orderRefund/${refundId}`);
         if (response.status === 200) {
            setRefundDetails(response.data?.data);
            setStatusOrderInformation(statusMapRefund[response.data?.data.orderRefundStatus]);
         }

      } catch (error: any) {
         messageToast.error(error.response.data.message);
         console.log('Lỗi khi lấy chi tiết đơn hoàn trả:', error);
         route.push('/account/order-refund');
      }
   };

   useEffect(() => {
      fetchOrderRefundDetails();
   }, [refundId]);

   return (
      <div className="min-h-screen bg-gray-50">
         <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">

            {/* Header Card */}
            <div className="bg-white shadow-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6">
               <div className="flex flex-col gap-4">
                  {/* Top row: Title and Button */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                     <div className="flex-1 min-w-0">
                        <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-gray-900 mb-2 sm:mb-3 break-words">
                           #REFUND-{refundDetails?.orderRefundId}
                        </h1>

                        {/* Info row - Stack on mobile */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-sm sm:text-base text-gray-600 mb-3">
                           <div className="flex items-center gap-1.5">
                              <Calendar size={16} className="flex-shrink-0" />
                              <span className="truncate">
                                 Tạo lúc: {formatDate(refundDetails?.createdAt)}
                              </span>
                           </div>
                           <span className="hidden sm:inline">•</span>
                           <div className="flex items-center gap-1.5">
                              <Package size={16} className="flex-shrink-0" />
                              <span>{refundDetails?.productCount} Sản phẩm</span>
                           </div>
                        </div>

                        {/* Status Badge */}
                        <div
                           className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-gray-200 bg-gray-100 w-fit"
                        >
                           {statusOrderInformation?.icon && (
                              <statusOrderInformation.icon size={16} />
                           )}
                           <span className="whitespace-nowrap">
                              {statusOrderInformation?.label}
                           </span>
                        </div>
                     </div>

                     {/* Back Button */}
                     <button
                        className="flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-all flex-shrink-0 w-full sm:w-auto"
                        onClick={() => route.back()}
                     >
                        <ArrowLeft size={16} />
                        <span>Quay lại</span>
                     </button>
                  </div>
               </div>
            </div>

            {/* Customer and Shipping Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
               {/* Customer Info */}
               <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">
                     Thông tin khách hàng
                  </h2>
                  <div className="space-y-3">
                     <div className="flex items-center gap-2.5 text-sm sm:text-base">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 break-words">{refundDetails?.customerName}</span>
                     </div>
                     <div className="flex items-center gap-2.5 text-sm sm:text-base">
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700">{refundDetails?.customerPhone}</span>
                     </div>
                     <div className="flex items-center gap-2.5 text-sm sm:text-base">
                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 break-all">{refundDetails?.customerEmail}</span>
                     </div>
                  </div>
               </div>

               {/* Shipping Info */}
               <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">
                     Địa chỉ nhận hàng
                  </h2>
                  <div className="space-y-3">
                     <div className="flex items-center gap-2.5 text-sm sm:text-base">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700 break-words">{refundDetails?.receiverName}</span>
                     </div>
                     <div className="flex items-start gap-2.5 text-sm sm:text-base">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 break-words">{refundDetails?.receiverAddress}</span>
                     </div>
                     <div className="flex items-center gap-2.5 text-sm sm:text-base">
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-700">{refundDetails?.receiverPhone}</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Images and Reason Section */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6">
               <h2 className="font-bold text-lg sm:text-xl lg:text-2xl text-gray-900 mb-3 sm:mb-4">
                  Hình ảnh & Lý do hoàn hàng
               </h2>

               {/* Customer Reason */}
               <div className="mb-4 sm:mb-5">
                  <p className="text-sm sm:text-base text-gray-600 mb-2 font-medium">
                     Lý do từ khách hàng:
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                     <p className="text-sm sm:text-base text-gray-800 leading-relaxed break-words">
                        {refundDetails?.customerReason}
                     </p>
                  </div>
               </div>

               {/* Images */}
               <div className="mb-4 sm:mb-5">
                  <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-3 font-medium">
                     Hình ảnh minh chứng:
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
                     {refundDetails?.customerImage?.map((img, index) => (
                        <div
                           key={index}
                           onClick={() => handlePreview(img)}
                           className="relative group aspect-square rounded-lg sm:rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                        >
                           <img
                              src={img}
                              alt={`Hình ${index + 1}`}
                              className="w-full h-full object-cover"
                           />
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all">
                              <span className="text-white text-xs sm:text-sm font-medium opacity-0 group-hover:opacity-100">
                                 Xem
                              </span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Staff Response */}
               <div>
                  <p className="text-sm sm:text-base text-gray-600 mb-2 font-medium">
                     Phản hồi từ nhân viên:
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                     <p className="text-sm sm:text-base text-gray-800 leading-relaxed break-words">
                        {refundDetails?.staffResponse || 'Chưa có phản hồi từ nhân viên.'}
                     </p>
                  </div>
               </div>

               {/* Image Preview Modal */}
               <Modal
                  open={previewVisible}
                  footer={null}
                  onCancel={handleClose}
                  centered
                  width="90%"
                  style={{ maxWidth: '800px' }}
               >
                  {selectedImage && (
                     <img
                        src={selectedImage}
                        alt="Preview"
                        className="w-full h-auto rounded-lg object-contain"
                     />
                  )}
               </Modal>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6 mb-4 sm:mb-6">
               <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">
                  Danh sách sản phẩm hoàn trả
               </h2>

               {/* Mobile: Card View */}
               <div className="block lg:hidden space-y-3">
                  {refundDetails?.items?.map((product, index) => (
                     <div key={index} className="border rounded-lg p-3">
                        <div className="flex gap-3 mb-3">
                           <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                              <img
                                 src={product?.variantImage}
                                 alt={product?.variantName}
                                 className="object-cover w-full h-full"
                              />
                           </div>
                           <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                                 {product.variantName}
                              </h3>
                              <div className="flex gap-2 text-xs text-gray-600">
                                 <span>{product?.variantColor}</span>
                                 <span>•</span>
                                 <span>{product?.variantSize}</span>
                              </div>
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                           <div>
                              <span className="text-gray-600">Đơn giá:</span>
                              <p className="font-medium text-gray-900">
                                 {formatPrice(product.variantPrice)}₫
                              </p>
                           </div>
                           <div>
                              <span className="text-gray-600">Số lượng:</span>
                              <p className="font-medium text-gray-900">{product.quantity}</p>
                           </div>
                           <div className="col-span-2">
                              <span className="text-gray-600">Tổng:</span>
                              <p className="font-semibold text-gray-900 text-base">
                                 {formatPrice(product.variantAmount)}₫
                              </p>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>

               {/* Desktop: Table View */}
               <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                     <thead className="border-b border-gray-200">
                        <tr className="text-left text-sm text-gray-600">
                           <th className="pb-3 font-semibold">SẢN PHẨM</th>
                           <th className="pb-3 font-semibold text-center">MÀU</th>
                           <th className="pb-3 font-semibold text-center">SIZE</th>
                           <th className="pb-3 font-semibold text-right">GIÁ</th>
                           <th className="pb-3 font-semibold text-center">SỐ LƯỢNG</th>
                           <th className="pb-3 font-semibold text-right">TỔNG</th>
                        </tr>
                     </thead>
                     <tbody>
                        {refundDetails?.items?.map((product, index) => (
                           <tr
                              key={index}
                              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                           >
                              <td className="py-4">
                                 <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100">
                                       <img
                                          src={product?.variantImage}
                                          alt={product?.variantName}
                                          className="object-cover w-full h-full"
                                       />
                                    </div>
                                    <span className="text-sm text-gray-800 font-medium">
                                       {product.variantName}
                                    </span>
                                 </div>
                              </td>
                              <td className="py-4 text-sm text-gray-700 text-center">
                                 {product?.variantColor}
                              </td>
                              <td className="py-4 text-sm text-gray-700 text-center">
                                 {product?.variantSize}
                              </td>
                              <td className="py-4 text-sm text-right font-medium text-gray-800">
                                 {formatPrice(product.variantPrice)}₫
                              </td>
                              <td className="py-4 text-sm text-center font-medium text-gray-800">
                                 {product.quantity}
                              </td>
                              <td className="py-4 text-sm text-right font-semibold text-gray-900">
                                 {formatPrice(product.variantAmount)}₫
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                  Tổng số lượng sản phẩm: {refundDetails?.productCount}
               </p>
            </div>

            {/* Payment and Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
               {/* Payment Info */}
               <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">
                     Thông tin thanh toán
                  </h2>
                  <div className="space-y-3 sm:space-y-4">
                     <div>
                        <p className="font-medium text-gray-700 mb-1 text-sm sm:text-base">
                           Phương thức
                        </p>
                        <p className="text-sm sm:text-base text-gray-900">Hoàn về ví</p>
                     </div>
                     <div>
                        <p className="font-medium text-gray-700 mb-1 text-sm sm:text-base">
                           Trạng thái
                        </p>
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border border-gray-200 bg-gray-100 text-gray-800">
                           {refundDetails?.transactionStatus ? statusMap[refundDetails?.transactionStatus]?.label : 'Chưa có giao dịch'}
                        </span>
                     </div>
                     <div>
                        <p className="font-medium text-gray-700 mb-1 text-sm sm:text-base">
                           Thời gian thanh toán
                        </p>
                        <p className="text-sm sm:text-base text-gray-900">
                           {formatDate(refundDetails?.transactionTime || undefined) || 'Chưa có thông tin'}
                        </p>
                     </div>
                  </div>
               </div>

               {/* Summary */}
               <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-5 lg:p-6 border border-gray-200">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">
                     Tổng tiền hoàn
                  </h2>

                  <div className="space-y-3">
                     <div className="flex justify-between text-sm sm:text-base">
                        <span className="text-gray-600">Tạm tính</span>
                        <span className="font-semibold text-gray-900">
                           {refundDetails?.amount ? formatPrice(refundDetails?.amount) : '0'}₫
                        </span>
                     </div>

                     <div className="border-t border-gray-200 pt-3 mt-3">
                        <div className="flex justify-between items-center">
                           <span className="text-base sm:text-lg font-semibold text-gray-900">
                              Tổng cộng
                           </span>
                           <span className="text-xl sm:text-2xl font-bold text-gray-900">
                              {refundDetails?.amount ? formatPrice(refundDetails?.amount) : '0'}₫
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

         </div>
      </div>
   );
}