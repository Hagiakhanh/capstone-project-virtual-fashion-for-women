"use client";

import { useEffect, useState } from "react";
import { RefreshCcw, Search } from "lucide-react";
import { Table, Button, Space } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { messageToast } from "@/helpers/toastHelper";
import { api } from "@/api/instance";
import formatPrice from "@/utils/formatPrice";
import formatDate from "@/utils/formatDate";
import statusMap from "@/helpers/statusMapper";
import { useRouter } from "next/navigation";

const ORDER_STATUSES = [
   { key: "Pending", value: 0, label: "Chờ thanh toán" },
   { key: "Confirmed", value: 1, label: "Đã xác nhận" },
   { key: "Packed", value: 2, label: "Đã đóng gói" },
   { key: "Delivering", value: 3, label: "Đang giao hàng" },
   { key: "Delivered", value: 4, label: "Đã giao hàng" },
   { key: "Completed", value: 5, label: "Hoàn tất" },
   { key: "Failed", value: 6, label: "Thất bại" },
   { key: "Returning", value: 7, label: "Đang trả hàng" },
   { key: "Returned", value: 8, label: "Đã trả hàng" },
];

export default function StaffOrderPage() {
   const [searchText, setSearchText] = useState("");
   const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
   const [isDateDecrease, setIsDateDecrease] = useState<boolean>(true);
   const [orders, setOrders] = useState<any[]>([]);
   const [pagination, setPagination] = useState({
      currentPage: 1,
      pageSize: 5,
      totalCount: undefined,
   });
   const router = useRouter();
   const [isSyncing, setIsSyncing] = useState<boolean>(false);

   const columns = [
      {
         title: "ID Đơn Hàng",
         dataIndex: "orderID",
         key: "orderID",
      },
      {
         title: "Ngày Tạo",
         key: "createdAt",
         render: (_: any, record: any) => (
            <div className="font-semibold text-gray-800">
               {formatDate(record?.createdAt)}
            </div>
         )
      },
      {
         title: "Khách Hàng",
         key: "name",
         render: (_: any, record: any) => (
            <div>
               <div className="font-semibold text-gray-800">{record?.receiverName}</div>
               <div className="text-gray-500">{record?.receiverPhone}</div>
               <div className="text-gray-500">{record?.email}</div>
            </div>
         ),
      },
      {
         title: "Tổng Cộng",
         key: "amount",
         render: (_: any, record: any) => (
            <div className="font-semibold text-gray-800">
               {formatPrice(record?.amount)} đ
            </div>
         ),
      },
      {
         title: "Trạng Thái",
         dataIndex: "status",
         key: "status",
         render: (status: keyof typeof statusMap) => {
            // 1. Tra cứu chi tiết trạng thái
            const detail = statusMap[status];

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
         render: (_: any, record: any) => (
            <Space>
               <EyeOutlined className="cursor-pointer text-gray-600 hover:text-black"
                  onClick={() => handleShowDetails(record.orderID)}
               />
            </Space>
         ),
      },
   ];

   const fetchOrdersData = async () => {
      try {
         const response = await api.get('/order/staff', {
            params: {
               PageIndex: pagination.currentPage,
               PageSize: pagination.pageSize,
               orderStatusEnum: selectedStatus,
               isDateDecrease: isDateDecrease,
            }
         });
         if (response.status === 200) {
            setOrders(response.data?.data || []);
            setPagination({
               ...pagination,
               totalCount: response.data?.pagination?.TotalCount,
               currentPage: response.data?.pagination?.CurrentPage,
            });
         } else {
            setOrders([]);
         }

      } catch (error) {
         console.log("Lấy dữ liệu đơn hàng thất bại:", error);
         messageToast.error("Lấy dữ liệu đơn hàng thất bại");
      }
   }

   const handleTableChange = (page: number) => {
      setPagination(prev => ({
         ...prev,
         currentPage: page,
      }));
   };
   const handleFilterChange = (status: number | null) => {
      setSelectedStatus(status);

      setPagination(prev => ({
         ...prev,
         currentPage: 1,
      }));
   };
   const handleSortChange = () => {
      setIsDateDecrease(prev => !prev);
      setPagination(prev => ({ ...prev, currentPage: 1 }));
   };
   const handleShowDetails = (orderID: string) => {
      router.push(`/staff/${orderID}`);
   }
   const handleSyncAllGHNOrders = async () => {
      setIsSyncing(true);
      try {
         const response = await api.put('/order/staff/sync-ghn-status');
         if (response.status === 200) {
            messageToast.success("Đồng bộ dữ liệu GHN thành công");
            fetchOrdersData();
         } else {
            messageToast.error("Đồng bộ dữ liệu GHN thất bại");
         }

      } catch (error) {
         messageToast.error("Đồng bộ dữ liệu GHN thất bại");
      } finally {
         setIsSyncing(false);
      }
   }

   useEffect(() => {
      fetchOrdersData();
   }, [pagination.currentPage, selectedStatus]);

   return (
      <div className="p-6 bg-gray-50 min-h-[80%]">
         {/* Header */}
         <h1 className="text-2xl font-bold mb-6">Quản lý đơn hàng</h1>

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
               dataSource={orders}
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
