'use client';

import { PaginationDTO } from '@/models/PaginationDTO';
import { CheckCircle, Clock, Store, Truck, XCircle, ClipboardCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import OrderRefundItem from '@/components/OrderRefund/OrderRefundItem';
import { api } from '@/api/instance';
import { OrderRefundDTO } from '@/models/OrderRefundDTO';
import { messageToast } from '@/helpers/toastHelper';

function OrdersRefund() {
   const [statusFilter, setStatusFilter] = useState<number | undefined>();
   const [pagination, setPagination] = useState<PaginationDTO>({
      CurrentPage: 1,
      HasNext: false,
      HasPrevious: false,
      PageSize: 5,
      TotalCount: 0,
      TotalPages: 0,
   });
   const [loading, setLoading] = useState(false);
   const [orderRefundData, setOrderRefundData] = useState<OrderRefundDTO[]>();

   const statusTabs = [
      { key: '', label: 'Tất cả', icon: null },
      { key: 'Pending', label: 'Chờ xác nhận', icon: Clock, index: 0 },
      { key: 'Accepted', label: 'Đã xác nhận', icon: ClipboardCheck, index: 1 },
      { key: 'Delivering', label: 'Đang hoàn hàng', icon: Truck, index: 3 },
      { key: 'Delivered', label: 'Đã hoàn hàng', icon: Store, index: 4 },
      { key: 'Completed', label: 'Hoàn tất', icon: CheckCircle, index: 5 },
      { key: 'Rejected', label: 'Từ chối', icon: XCircle, index: 2 },
   ];

   const handlePageChange = (newPage: number) => {
      if (newPage >= 1 && newPage <= pagination.TotalPages) {
         setPagination((prev) => ({ ...prev, CurrentPage: newPage }));
      }
   };

   function getPageNumbers(totalPages: number, currentPage: number, delta = 2): (number | string)[] {
      const range: (number | string)[] = [];
      const left = Math.max(2, currentPage - delta);
      const right = Math.min(totalPages - 1, currentPage + delta);
      range.push(1);
      if (left > 2) {
         range.push("...");
      }
      for (let i = left; i <= right; i++) {
         range.push(i);
      }
      if (right < totalPages - 1) {
         range.push("...");
      }
      if (totalPages > 1) {
         range.push(totalPages);
      }
      return range;
   }

   const fetchOrderRefund = async () => {
      try {
         setLoading(true);
         const response = await api.get('/orderRefund', {
            params: {
               PageIndex: pagination.CurrentPage,
               PageSize: pagination.PageSize,
               refundStatus: statusFilter,
            }
         });
         if (response.status === 200) {
            setOrderRefundData(response.data?.data);
            setPagination((prev) => ({
               ...prev,
               ...response.data?.pagination
            }));
         } else {
            setOrderRefundData([]);
         }

      } catch (error) {
         setOrderRefundData([]);
         messageToast.error('Lỗi khi lấy danh sách đơn hàng hoàn trả.');
         console.log('Lỗi khi lấy danh sách đơn hàng hoàn trả:', error);
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      fetchOrderRefund();
   }, [statusFilter, pagination.CurrentPage, pagination.PageSize]);

   return (
      <div className=" bg-gray-50">
         <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
               <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-2">
                  Yêu cầu hoàn hàng
               </h1>
               {orderRefundData && orderRefundData.length > 0 && (
                  <p className="text-sm sm:text-base text-gray-600">
                     Tổng {pagination.TotalCount} yêu cầu
                  </p>
               )}
            </div>

            {/* Filter tabs - Horizontal scroll on mobile */}
            <div className="mb-4 sm:mb-6 -mx-3 px-3 sm:mx-0 sm:px-0 overflow-hidden">
               <div className="flex sm:flex-wrap gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {statusTabs.map((tab) => {
                     const Icon = tab.icon;
                     const active = statusFilter === tab.index;
                     return (
                        <button
                           key={tab.key}
                           onClick={() => {
                              setStatusFilter(tab.index);
                              setPagination((prev) => ({ ...prev, CurrentPage: 1 }));
                           }}
                           className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full border transition-all flex-shrink-0 ${active
                              ? 'bg-black text-white border-black shadow-md'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                              }`}
                        >
                           {Icon && <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />}
                           <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                              {tab.label}
                           </span>
                        </button>
                     );
                  })}
               </div>
            </div>


            {/* Orders List */}
            <div className="mb-6 sm:mb-8">
               <div className="space-y-3 sm:space-y-4">
                  {loading ? (
                     <div className="py-12 sm:py-20 bg-white rounded-xl sm:rounded-2xl shadow-sm">
                        <LoadingSpinner size={50} />
                     </div>
                  ) : (
                     orderRefundData?.length === 0 ? (
                        <div className="text-center p-8 sm:p-12 bg-white rounded-xl sm:rounded-2xl shadow-sm">
                           <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                              <ClipboardCheck className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                           </div>
                           <p className="text-gray-500 text-sm sm:text-base">
                              Không có yêu cầu hoàn hàng nào
                           </p>
                        </div>
                     ) : (
                        orderRefundData?.map((order) => (
                           <OrderRefundItem key={order.orderRefundId} data={order} />
                        ))
                     )
                  )}
               </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap justify-center items-center gap-2">
               {/* Nút trước - Hidden on mobile if too many pages */}
               <button
                  disabled={pagination.CurrentPage === 1}
                  onClick={() => handlePageChange(pagination.CurrentPage - 1)}
                  className="hidden sm:flex px-3 sm:px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
               >
                  « Trước
               </button>

               {/* Mobile: Show prev button as arrow */}
               <button
                  disabled={pagination.CurrentPage === 1}
                  onClick={() => handlePageChange(pagination.CurrentPage - 1)}
                  className="sm:hidden px-3 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
               >
                  «
               </button>

               {/* Page numbers */}
               {getPageNumbers(pagination.TotalPages, pagination.CurrentPage).map((page, idx) => (
                  <button
                     key={idx}
                     onClick={() => typeof page === 'number' && handlePageChange(page)}
                     disabled={page === "..."}
                     className={`px-3 sm:px-4 py-2 rounded-lg border transition-all text-sm ${pagination.CurrentPage === page
                        ? 'bg-black text-white border-black font-medium'
                        : 'bg-white hover:bg-gray-100 text-gray-700'
                        } ${page === "..." ? 'cursor-default opacity-70' : ''}`}
                  >
                     {page}
                  </button>
               ))}

               {/* Nút sau - Hidden text on mobile */}
               <button
                  disabled={pagination.CurrentPage === pagination.TotalPages}
                  onClick={() => handlePageChange(pagination.CurrentPage + 1)}
                  className="hidden sm:flex px-3 sm:px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
               >
                  Sau »
               </button>

               {/* Mobile: Show next button as arrow */}
               <button
                  disabled={pagination.CurrentPage === pagination.TotalPages}
                  onClick={() => handlePageChange(pagination.CurrentPage + 1)}
                  className="sm:hidden px-3 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
               >
                  »
               </button>
            </div>
         </div>

         {/* Custom scrollbar hide */}
         <style jsx global>{`
            .scrollbar-hide::-webkit-scrollbar {
               display: none;
            }
            .scrollbar-hide {
               -ms-overflow-style: none;
               scrollbar-width: none;
            }
         `}</style>
      </div>
   )
}

export default OrdersRefund;