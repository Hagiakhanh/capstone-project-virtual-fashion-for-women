"use client";

import { useEffect, useState } from "react";
import { RefreshCcw, Search } from "lucide-react";
import { Table, Button, Space } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { api } from "@/api/instance";
import formatPrice from "@/utils/formatPrice";
import formatDate from "@/utils/formatDate";
import { useRouter } from "next/navigation";
import { OrderRefundStaffDTO } from "@/models/OrderRefundDTO";
import type { ColumnsType } from "antd/es/table";
import statusMapRefund from "@/helpers/statusMapperRefund";
import { messageToast } from "@/helpers/toastHelper";

const ORDER_STATUSES = [
   { key: "Pending", value: 0, label: "Chờ xác nhận" },
   { key: "Accepted", value: 1, label: "Đã xác nhận" },
   { key: "Delivering", value: 3, label: "Đang hoàn hàng" },
   { key: "Delivered", value: 4, label: "Đã hoàn hàng" },
   { key: "Completed", value: 5, label: "Hoàn tất" },
   { key: "Rejected", value: 2, label: "Từ chối yêu cầu" },
];



export default function RefundPage() {
   const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
   const [pagination, setPagination] = useState({
      currentPage: 1,
      pageSize: 5,
      totalCount: undefined,
   });
   const [orderRefunds, setOrderRefunds] = useState<OrderRefundStaffDTO[]>([]);
   const router = useRouter();
   const [isSyncing, setIsSyncing] = useState<boolean>(false);

   const columns: ColumnsType<OrderRefundStaffDTO> = [
      {
         title: "ID Yêu Cầu",
         dataIndex: "orderRefundId",
         key: "orderRefundId",
      },
      {
         title: "Ngày Tạo",
         key: "createdAt",
         render: (_: any, record: OrderRefundStaffDTO) => (
            <div className="font-semibold text-gray-800">
               {formatDate(record?.createdAt)}
            </div>
         )
      },
      {
         title: "Khách Hàng",
         key: "name",
         render: (_: any, record: OrderRefundStaffDTO) => (
            <div>
               <div className="font-semibold text-gray-800">{record?.receiverName}</div>
               <div className="text-gray-500">{record?.receiverPhone}</div>
               <div className="text-gray-500">{record?.email}</div>
            </div>
         ),
      },
      {
         title: "Lý Do Trả Hàng",
         key: "reason",
         render: (_: any, record: OrderRefundStaffDTO) => (
            <div className="font-semibold text-gray-800 line-clamp-3">{record?.reason}</div>
         ),
      },
      {
         title: "Số Tiền Hoàn",
         key: "amount",
         render: (_: any, record: OrderRefundStaffDTO) => (
            <div className="font-semibold text-gray-800">
               {formatPrice(record?.amount)} đ
            </div>
         ),
      },
      {
         title: "Trạng Thái",
         dataIndex: "status",
         key: "status",
         render: (status: keyof typeof statusMapRefund) => {
            // 1. Tra cứu chi tiết trạng thái
            const detail = statusMapRefund[status];

            return (
               <div className="font-semibold text-gray-800">
                  {detail.label}
               </div>
            );
         },
      },
      {
         title: "Thao Tác",
         key: "action",
         render: (_: any, record: OrderRefundStaffDTO) => (
            <Space>
               <EyeOutlined className="cursor-pointer text-gray-600 hover:text-black"
                  onClick={() => handleShowDetails(record.orderRefundId)}
               />
            </Space>
         ),
      },
   ];

   const handleFilterChange = (status: number | null) => {
      setSelectedStatus(status);

      setPagination(prev => ({
         ...prev,
         currentPage: 1,
      }));
   };

   const handleTableChange = (page: number) => {
      setPagination(prev => ({
         ...prev,
         currentPage: page,
      }));
   };

   const handleShowDetails = (orderRefundId: number) => {
      router.push(`/staff/order-refund/${orderRefundId}`);
   }

   const handleSyncAllGHNOrders = async () => {
         setIsSyncing(true);
         try {
            const response = await api.put('/orderRefund/staff/sync-ghn-status');
            if (response.status === 200) {
               messageToast.success("Đồng bộ dữ liệu GHN thành công");
               fetchOrderRefund();
            } else {
               messageToast.error("Đồng bộ dữ liệu GHN thất bại");
            }
   
         } catch (error) {
            messageToast.error("Đồng bộ dữ liệu GHN thất bại");
         } finally {
            setIsSyncing(false);
         }
      }

   const fetchOrderRefund = async () => {
      try {
         const response = await api.get('/orderRefund/staff', {
            params: {
               PageIndex: pagination.currentPage,
               PageSize: pagination.pageSize,
               refundEnum: selectedStatus
            }
         });
         if (response.status === 200) {
            setOrderRefunds(response.data?.data || []);
            setPagination({
               ...pagination,
               totalCount: response.data?.pagination?.TotalCount,
               currentPage: response.data?.pagination?.CurrentPage,
            });
         } else {
            setOrderRefunds([]);
         }

      } catch (error) {
         messageToast.error('Lỗi khi lấy danh sách đơn hàng hoàn trả.')
         console.log('Lỗi khi lấy danh sách đơn hàng hoàn trả:', error);
      }
   }

   useEffect(() => {
      fetchOrderRefund();
   }, [pagination.currentPage, selectedStatus]);

   return (
      <div className="p-6 bg-gray-50 min-h-[80%]">
         {/* Header */}
         <h1 className="text-2xl font-bold mb-6">Yêu cầu hoàn hàng</h1>

         {/* Search + Filter */}
         <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between mb-6">
            <div className="flex items-center w-2/3 border rounded-lg px-3 py-2">
               <Search className="w-5 h-5 text-gray-400" />
               <input
                  type="text"
                  placeholder="Tìm kiếm theo ID đơn hàng, tên khách hàng, email, số điện thoại..."
                  className="w-full outline-none px-3 text-sm text-gray-600"
               />
            </div>
            <div className="flex gap-2">
               {/* <button className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-100">
                  <Filter className="w-4 h-4" /> Filters
               </button> */}
               <button className="bg-black text-white rounded-lg px-5 py-2 hover:bg-gray-800">
                  Apply
               </button>
               <Button
                  onClick={handleSyncAllGHNOrders}
                  disabled={isSyncing}
                  icon={<RefreshCcw size={16} />}
                  className="!border-[#000] !text-base !text-black !hover:text-black"
                  size="large"
               >
                  Đồng bộ dữ liệu GHN
               </Button>
            </div>
         </div>

         <div className="flex gap-2 mb-6 overflow-x-auto pb-2 flex-shrink-0">
            {/* Nút 'Tất cả' */}
            <Button
               type={selectedStatus === null ? "primary" : "default"}
               onClick={() => handleFilterChange(null)}
               className="flex-shrink-0"
            >
               Tất Cả
            </Button>

            {/* Render các nút trạng thái */}
            {ORDER_STATUSES.map(status => (
               <Button
                  key={status.key}
                  type={selectedStatus === status.value ? "primary" : "default"}
                  onClick={() => handleFilterChange(status.value)}
                  className="flex-shrink-0"
               >
                  {status.label}
               </Button>
            ))}
         </div>

         {/* Table */}
         <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <Table
               columns={columns}
               dataSource={orderRefunds}
               pagination={{
                  pageSize: 5,
                  current: pagination.currentPage,
                  total: pagination.totalCount,
                  onChange: (page) => handleTableChange(page),
                  showTotal: (total, range) =>
                     `Hiển thị ${range[0]}–${range[1]} trong tổng ${total} đơn hàng`,
               }}
               rowKey="orderID"
            />
         </div>

      </div>
   );
}