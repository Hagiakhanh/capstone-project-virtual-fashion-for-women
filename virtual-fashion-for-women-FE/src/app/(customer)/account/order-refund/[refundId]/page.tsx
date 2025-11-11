'use client';

import { api } from "@/api/instance";
import formatDate from "@/utils/formatDate";
import formatPrice from "@/utils/formatPrice";
import { Calendar, MapPin, Mail, Phone, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { OrderRefundDetailDTO } from "@/models/OrderRefundDTO";
import statusMapRefund from "@/helpers/statusMapperRefund";
import { Modal } from "antd";
import { messageToast } from "@/helpers/toastHelper";

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

      } catch (error) {
         messageToast.error('Lỗi khi lấy chi tiết đơn hoàn trả.');
         console.log('Lỗi khi lấy chi tiết đơn hoàn trả:', error);
      }
   };

   useEffect(() => {
      fetchOrderRefundDetails();
   }, [refundId]);

   return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-4">
         <div className="max-w-6xl mx-auto">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white shadow-sm rounded-xl p-4">
               <div className="flex flex-col gap-2 text-gray-700">
                  <h1 className="font-bold text-2xl text-black">#REFUND-{refundDetails?.orderRefundId}</h1>

                  <div className="flex items-center gap-2 text-base text-gray-500">
                     <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Tạo lúc: {formatDate(refundDetails?.createdAt)}
                     </span>
                     <span>• {refundDetails?.productCount} Sản phẩm</span>
                  </div>
                  <span
                     className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium border border-gray-200 bg-gray-100 w-fit"
                  >
                     {statusOrderInformation?.icon && (
                        <statusOrderInformation.icon
                           size={18} className="m-1"
                        />
                     )}
                     <span className="text-sm font-medium" >
                        {statusOrderInformation?.label}
                     </span>
                  </span>

               </div>

               <div className="flex gap-3 mt-3 sm:mt-0">
                  <button
                     className="mt-3 cursor-pointer sm:mt-0 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-all"
                     onClick={() => {
                        route.back()
                     }}
                  >
                     Quay lại
                  </button>
               </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
               <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold mb-4">Khách hàng</h2>
                  <div className="space-y-3">
                     <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{refundDetails?.customerName}</span>
                     </div>
                     <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{refundDetails?.customerPhone}</span>
                     </div>
                     <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{refundDetails?.customerEmail}</span>
                     </div>
                  </div>
               </div>

               {/* Shipping Info */}
               <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold mb-2">Địa chỉ giao hàng</h2>
                  <div className="space-y-2">
                     <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <p className="text-sm ">{refundDetails?.receiverName}</p>
                     </div>
                     <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <p className="text-sm ">{refundDetails?.receiverAddress}</p>
                     </div>
                     <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="text-sm ">Điện thoại: {refundDetails?.receiverPhone}</p>
                     </div>

                  </div>
               </div>
            </div>

            {/* Hình ảnh và lý do */}
            <div className="px-6 py-4 mb-6 border-1 border-[#E5E5E5] rounded-2xl shadow-md bg-white">
               <h2 className="font-bold text-xl text-black pb-3">Hình ảnh & Lý do hoàn hàng</h2>

               {/* Lý do hoàn hàng */}
               <div className="mb-4">
                  <p className="text-base text-gray-600 mb-1">Lý do từ khách hàng:</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                     <p className="text-gray-800 leading-relaxed">
                        {refundDetails?.customerReason}
                     </p>
                  </div>
               </div>

               {/* Danh sách hình ảnh */}
               <div className="mb-4">
                  <p className="text-base text-gray-600 mb-2">Hình ảnh minh chứng:</p>
                  <div className="flex flex-wrap gap-3">
                     {refundDetails?.customerImage?.map((img, index) => (
                        <div
                           key={index}
                           onClick={() => handlePreview(img)}
                           className="relative group w-[120px] h-[120px] rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                           <img
                              src={img}
                              alt={`Hình ${index + 1}`}
                              className="w-full h-full object-cover"
                           />
                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-all">
                              <span className="text-white text-sm opacity-0 group-hover:opacity-100">
                                 Xem
                              </span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Nhân viên */}
               <div className="mb-4">
                  <p className="text-base text-gray-600 mb-1">Phản hồi từ nhân viên:</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                     <p className="text-gray-800 leading-relaxed">
                        {refundDetails?.staffResponse || 'Chưa có phản hồi từ nhân viên.'}
                     </p>
                  </div>
               </div>

               <Modal
                  open={previewVisible}
                  footer={null}
                  onCancel={handleClose}
                  centered
                  width={800}
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
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
               <h2 className="text-2xl font-bold mb-4">Danh sách hoàn hàng</h2>
               <div className="overflow-x-auto">
                  <table className="w-full">
                     <thead className="border-b">
                        <tr className="text-left text-sm text-gray-500">
                           <th className="pb-3 font-medium">SẢN PHẨM</th>
                           {/* Thay đổi màu và size cho 2 cột này */}
                           <th className="pb-3 pr-4 font-semibold text-[13px] tracking-wide text-center">
                              MÀU
                           </th>
                           <th className="pb-3 pr-4 font-semibold text-[13px] tracking-wide text-center">
                              SIZE
                           </th>
                           {/* Thêm padding trái cho 3 cột cuối */}
                           <th className="pb-3 font-medium text-right pl-4">GIÁ / SẢN PHẨM</th>
                           <th className="pb-3 font-medium text-center pl-4">SỐ LƯỢNG</th>
                           <th className="pb-3 font-medium text-right pl-4">TỔNG TIỀN</th>
                        </tr>
                     </thead>
                     <tbody>
                        {refundDetails?.items?.map((product, index) => (
                           <tr
                              key={index}
                              className="border-b hover:bg-gray-50 transition-colors"
                           >
                              <td className="py-4 px-2">
                                 <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                                       <img
                                          src={product?.variantImage}
                                          alt={product?.variantName}
                                          className="object-cover w-full h-full"
                                       />
                                    </div>
                                    <div className="flex flex-col">
                                       <span className=" text-gray-800 leading-tight">
                                          {product.variantName}
                                       </span>
                                    </div>
                                 </div>
                              </td>

                              <td className="py-4 text-sm text-gray-800 text-center pr-4">
                                 {product?.variantColor}
                              </td>

                              <td className="py-4 text-sm text-center pr-4">
                                 <div className="flex items-center justify-center gap-1 text-gray-800">
                                    <span>
                                       {product?.variantSize}
                                    </span>
                                 </div>
                              </td>

                              <td className="py-4 text-sm text-right font-medium text-gray-800 pl-4">
                                 {formatPrice(product.variantPrice)} đ
                              </td>

                              <td className="py-4 text-sm text-center font-medium pl-4">
                                 {product.quantity}
                              </td>

                              <td className="py-4 text-sm text-right font-semibold text-gray-800 pl-4">
                                 {formatPrice(product.variantAmount)} đ
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>

               </div>
               <p className="text-sm text-gray-500 mt-4">Số lượng sản phẩm: {refundDetails?.productCount}</p>
            </div>

            {/* Payment and Summary */}
            <div className="grid md:grid-cols-2 gap-6">
               <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold mb-4">Thanh toán</h2>
                  <div className="space-y-3 mb-6">
                     <div>
                        <p className="font-medium text-black">Phương thức</p>
                        <p>Hoàn về ví</p>
                     </div>
                     {/* <div>
                        <p className="font-medium text-black italic">Mã giao dịch</p>
                        <p >1111</p>
                     </div> */}
                     <div>
                        <p className="font-medium text-black">Trạng thái</p>
                        <span
                           className={`inline-flex items-center p-2 rounded-full text-sm font-medium border-gray-200 bg-gray-100 text-gray-800`}
                        // style={{ color: statusPaymentInformation.color }}
                        >
                           {refundDetails?.transactionStatus || 'Chưa có giao dịch'}
                        </span>

                     </div>
                     <div>
                        <p className="font-medium text-black">Thời gian thanh toán</p>
                        <p>{formatDate(refundDetails?.transactionTime || undefined) || 'Chưa có thông tin'}</p>
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-2xl font-bold mb-4">Tiền hoàn</h2>
                  <div className="space-y-3">
                     <div className="flex justify-between text-base">
                        <span className="text-gray-600">Tạm tính</span>
                        <span className="font-bold">{refundDetails?.amount ? formatPrice(refundDetails?.amount) : '0'} đ</span>
                     </div>

                     {/* <div className="flex justify-between text-base">
                        <span className="text-gray-600">Phí vận chuyển</span>
                        <span className="font-bold">20.000 đ</span>
                     </div> */}
                     {/* {(order?.insuranceFee ?? 0) > 0 && (
                        <div className="flex justify-between text-base">
                           <span className="text-gray-600">Phí bảo hiểm</span>
                           <span className=" font-bold">{formatPrice(order?.insuranceFee ?? 0)} đ</span>
                        </div>
                     )} */}
                     <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between items-center">
                           <span className="text-lg font-semibold">Tổng thanh toán</span>
                           <span className="font-bold">{refundDetails?.amount ? formatPrice(refundDetails?.amount) : '0'} đ</span>
                        </div>
                     </div>
                  </div>
               </div>

            </div>

         </div>
      </div>
   );
}