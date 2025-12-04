'use client';

import statusMapRefund from "@/helpers/statusMapperRefund";
import { OrderRefundDTO } from "@/models/OrderRefundDTO";
import formatDate from "@/utils/formatDate";
import formatPrice from "@/utils/formatPrice";
import { Calendar, MapPin, ChevronRight } from 'lucide-react';
import { useRouter } from "next/navigation";

export default function OrderRefundItem({ data }: { data: OrderRefundDTO }) {

   const statusInfo = statusMapRefund[data.status] || {
      label: 'Không xác định',
      color: '#7F8C8D',
      bg: '#ECF0F1',
      icon: Calendar,
   };

   const StatusIcon = statusInfo.icon;
   const productCount = data.itemRefunds.length;
   const firstName = data.itemRefunds[0]?.productVarientName || 'Sản phẩm';
   const router = useRouter();

   return (
      <div
         className="w-full bg-white rounded-xl sm:rounded-2xl shadow-sm border p-4 sm:p-6 hover:shadow-md transition-all cursor-pointer"
         onClick={() => router.push(`/account/order-refund/${data.orderRefundId}`)}
      >
         {/* Header - Stacked on mobile */}
         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-4 pb-4 border-b border-gray-100">
            <div className="flex-1 min-w-0">
               {/* Order ID and Status */}
               <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                  <span className="font-bold text-base sm:text-lg text-gray-900">
                     REFUND-{data.orderRefundId}
                  </span>
                  <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-full" style={{ backgroundColor: statusInfo.bg }}>
                     <StatusIcon size={14} className="sm:w-4 sm:h-4 flex-shrink-0" color={statusInfo.color} />
                     <span
                        className="text-xs sm:text-sm font-medium whitespace-nowrap"
                        style={{ color: statusInfo.color }}
                     >
                        {statusInfo.label}
                     </span>
                  </div>
               </div>

               {/* Info - Stack on mobile */}
               <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-6 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                     <Calendar size={16} className="sm:w-[18px] sm:h-[18px] text-gray-400 flex-shrink-0" />
                     <span>{formatDate(data.createdAt)}</span>
                  </div>
                  <div className="flex items-start gap-2 min-w-0">
                     <MapPin size={16} className="sm:w-[18px] sm:h-[18px] text-gray-400 flex-shrink-0 mt-0.5" />
                     <span className="line-clamp-2 sm:line-clamp-1 break-words flex-1">
                        {data.address}
                     </span>
                  </div>
               </div>
            </div>

            {/* Total Amount */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-1 flex-shrink-0 sm:ml-4">
               <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">Tổng tiền</div>
               <div className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap">
                  {formatPrice(data.amount ?? 0)}₫
               </div>
            </div>
         </div>

         {/* Products Section */}
         <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
            {/* Left - Images and description */}
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
               {/* Product Images */}
               <div className="flex -space-x-2 sm:-space-x-3 flex-shrink-0">
                  {data?.itemRefunds?.slice(0, 2).map((item, i) => (
                     <div
                        key={i}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 border-white overflow-hidden bg-white shadow-sm"
                     >
                        <img
                           src={item.productVarientImage}
                           alt={item.productVarientName}
                           className="w-full h-full object-cover"
                        />
                     </div>
                  ))}

                  {productCount > 2 && (
                     <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 border-white overflow-hidden bg-white shadow-sm relative">
                        <img
                           src={data.itemRefunds[2]?.productVarientImage}
                           alt={data.itemRefunds[2]?.productVarientName}
                           className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                           <span className="text-white font-bold text-xs sm:text-sm">
                              +{productCount - 2}
                           </span>
                        </div>
                     </div>
                  )}
               </div>

               {/* Product Info */}
               <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm sm:text-base text-gray-800 mb-0.5 sm:mb-1 line-clamp-2">
                     {firstName}
                     {productCount > 1 && (
                        <span className="text-gray-600">
                           {' '}và {productCount - 1} sản phẩm khác
                        </span>
                     )}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500">
                     {productCount} sản phẩm
                  </div>
               </div>
            </div>

            {/* Right - Action button */}
            <div className="flex sm:flex-shrink-0">
               {/* Mobile: Full width button */}
               <button
                  onClick={(e) => {
                     e.stopPropagation();
                     router.push(`/account/order-refund/${data.orderRefundId}`);
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition-all active:scale-[0.98]"
               >
                  <span>Xem chi tiết</span>
                  <ChevronRight size={16} className="sm:hidden" />
               </button>
            </div>
         </div>

      </div>
   )
}