'use client';

import { PaginationDTO } from '@/models/PaginationDTO';
import { CheckCircle, Clock, Store, Truck, XCircle, ClipboardCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';
import OrderRefundItem from '@/components/OrderRefund/OrderRefundItem';
import { api } from '@/api/instance';
import { OrderRefundDTO } from '@/models/OrderRefundDTO';

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
      { key: 'Rejected', label: 'Từ chối yêu cầu', icon: XCircle, index: 2 },
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
         console.log('Lỗi khi lấy danh sách đơn hàng hoàn trả:', error);
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      fetchOrderRefund();
   }, [statusFilter, pagination.CurrentPage, pagination.PageSize]);

   return (
      <div className="bg-gradient-to-br">
         <div className="max-w-7xl mx-auto flex-1 flex flex-col">
            {/* Header */}
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">Yêu cầu hoàn hàng</h1>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-3 mb-6">
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
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${active
                           ? 'bg-black text-white border-black shadow'
                           : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                           }`}
                     >
                        {Icon && <Icon size={18} />}
                        <span className="text-sm font-medium">{tab.label}</span>
                     </button>
                  );
               })}
            </div>

            {/* Orders List - Fixed height container */}
            <div className="flex-1 mb-6">
               <div className="space-y-4">
                  {loading ? (
                     <div className="py-20">
                        <LoadingSpinner size={50} />
                     </div>
                  ) : (
                     orderRefundData?.length === 0 ? (
                        <div className="text-center p-12 bg-white rounded-2xl shadow text-gray-500">
                           Không có yêu cầu hoàn hàng nào
                        </div>
                     ) : (
                        orderRefundData?.map((order) => <OrderRefundItem data={order} />)
                     )
                  )}
               </div>
            </div>

            <div className="flex justify-center items-center gap-3">
               {/* Nút trước */}
               <button
                  disabled={pagination.CurrentPage === 1}
                  onClick={() => handlePageChange(pagination.CurrentPage - 1)}
                  className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
               >
                  « Trước
               </button>

               {getPageNumbers(pagination.TotalPages, pagination.CurrentPage).map((page, idx) => (
                  <button
                     key={idx}
                     onClick={() => typeof page === 'number' && handlePageChange(page)}
                     disabled={page === "..."}
                     className={`px-4 py-2 rounded-lg border transition-all ${pagination.CurrentPage === page
                        ? 'bg-black text-white border-black'
                        : 'bg-white hover:bg-gray-100'
                        } ${page === "..." ? 'cursor-default opacity-70' : ''}`}
                  >
                     {page}
                  </button>
               ))}

               {/* Nút sau */}
               <button
                  disabled={pagination.CurrentPage === pagination.TotalPages}
                  onClick={() => handlePageChange(pagination.CurrentPage + 1)}
                  className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
               >
                  Sau »
               </button>
            </div>

         </div>
      </div>
   )
}

export default OrdersRefund;