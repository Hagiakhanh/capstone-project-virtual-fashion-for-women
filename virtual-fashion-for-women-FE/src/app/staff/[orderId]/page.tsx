"use client";

import { Table, Steps, Button } from "antd";
import { Box, RefreshCcw } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import { useParams } from "next/navigation";
import { api } from "@/api/instance";
import { useEffect, useState } from "react";
import formatDate from "@/utils/formatDate";
import { OrderStaffResponseDTO } from "@/models/OrderDTO";
import { OrderDetailStaffResponseDTO } from "@/models/OrderDetailDTO";
import formatPrice from "@/utils/formatPrice";
import { messageToast } from "@/helpers/toastHelper";
import { GhnStatusDTO } from "@/models/GhnDTO";
import statusMap from "@/helpers/statusMapper";

export default function StaffOrderDetailsPage() {
   const params = useParams();
   const orderId = params.orderId as string;
   const [orderData, setOrderData] = useState<OrderStaffResponseDTO | null>(null);
   const [isSyncing, setIsSyncing] = useState<boolean>(false);
   const [hasReturnedStatus, setHasReturnedStatus] = useState<boolean>(false);

   const fetchOrderDetails = async () => {
      try {
         if (!orderId) {
            return;
         }
         const response = await api.get(`/order/staff/${orderId}`);
         if (response.status === 200) {
            console.log("Chi tiết đơn hàng:", response.data);
            setOrderData(response.data);
            const hasReturned = response.data.responseStatusLogs.some(
               (log: any) => log.status === "Returned" || log.status === "Returning"
            );
            setHasReturnedStatus(hasReturned);
         }

      } catch (error) {
         console.error('Lỗi khi lấy thông tin chi tiết đơn hàng:', error);
      }
   }

   // const getStatusText = (status: string | undefined) => {
   //    switch (status) {
   //       case 'Pending': return 'Chờ thanh toán';
   //       case 'Confirmed': return 'Đã xác nhận';
   //       case 'Packed': return 'Đã đóng gói';
   //       case 'Delivering': return 'Đang giao';
   //       case 'Delivered': return 'Đã giao';
   //       case 'Completed': return 'Hoàn thành';
   //       default: return status || 'Không rõ';
   //    }
   // };
   const getStatusText = (status: string | undefined) => {
      switch (status) {
         case "Pending":
            return "Chờ thanh toán";
         case "Confirmed":
            return "Đã xác nhận";
         case "Packed":
            return "Đã đóng gói";
         case "Delivering":
            return "Đang giao hàng";
         case "Delivered":
            return "Đã giao hàng";
         case "Returning":
            return "Đang trả hàng";
         case "Returned":
            return "Trả hàng thành công";
         case "Completed":
            return "Hoàn thành";
         default:
            return status || "Không rõ";
      }
   };

   useEffect(() => {
      fetchOrderDetails();
   }, [orderId]);

   const deliverySuccessSteps = [
      { title: "Chờ thanh toán" },
      { title: "Đã xác nhận" },
      { title: "Đã đóng gói" },
      { title: "Đang giao hàng" },
      { title: "Đã giao hàng" },
      { title: "Hoàn thành" },
   ];

   const deliveryFailedSteps = [
      { title: "Chờ thanh toán" },
      { title: "Đã xác nhận" },
      { title: "Đã đóng gói" },
      { title: "Giao hàng thất bại" },
      { title: "Đang trả hàng" },
      { title: "Trả hàng thành công" },
   ];
   const getSteps = () => {
      if (!hasReturnedStatus) return deliverySuccessSteps;

      if (hasReturnedStatus) {
         return deliveryFailedSteps;
      }

      return deliverySuccessSteps;
   };
   const items = getSteps();
   const currentStatusText = getStatusText(orderData?.status);
   console.log("Current Status Text:", currentStatusText);
   console.log("Steps Items:", items);
   const currentStepIndex = items.findIndex(item => item.title === currentStatusText);
   const currentStep = currentStepIndex !== -1 ? currentStepIndex : 0;

   const columns: ColumnsType<OrderDetailStaffResponseDTO> = [
      {
         title: "Sản phẩm",
         dataIndex: "productName",
         key: "productName",
         render: (text, record) => (
            console.log(record),
            <div className="flex items-center space-x-3">
               {/* Hình ảnh sản phẩm (imageUrl) */}
               <img
                  src={record.imageUrl}
                  alt={record.productName}
                  className="w-12 h-12 object-cover rounded-md border border-gray-200"
               />
               {/* Tên sản phẩm */}
               <div className="font-medium text-black">
                  {text}
               </div>
            </div>
         )
      },
      {
         title: "Kích thước",
         dataIndex: "size",
         key: "size",
         align: "center",
      },
      {
         title: "Màu sắc",
         dataIndex: "colorName",
         key: "colorName",
         align: "center",
      },
      {
         title: "Giá",
         dataIndex: "price",
         key: "price",
         align: "center",
         render: (value, record) => (
            <span>{formatPrice(value)}đ</span>
         )
      },
      {
         title: "Số lượng",
         dataIndex: "quantity",
         key: "quantity",
         align: "center",
      },
      {
         title: "Tổng cộng",
         dataIndex: "amount",
         key: "amount",
         align: "center",
         render: (value, record) => (
            <span>{formatPrice(value)}đ</span>
         )
      },
   ];

   const getPaymentStatusInfo = (status: 'Pending' | 'Success' | 'Failed' | undefined) => {

      let text = 'Chưa rõ';
      let className = 'bg-gray-100 text-gray-700';

      switch (status) {
         case 'Pending':
            text = 'Chờ thanh toán';
            className = 'bg-yellow-100 text-yellow-700';
            break;
         case 'Success':
            text = 'Đã thanh toán';
            className = 'bg-green-100 text-green-700';
            break;
         case 'Failed':
            text = 'Thất bại';
            className = 'bg-red-100 text-red-700';
            break;
         default:
            text = 'Chưa xác định';
            className = 'bg-gray-100 text-gray-700';
            break;
      }

      return { text, className };
   };
   const statusInfo = getPaymentStatusInfo(orderData?.paymentStatus);

   const handlePrepareOrder = async () => {
      if (orderData?.status !== 'Confirmed') {
         return;
      }
      try {
         const response = await api.put(`/order/staff/${orderId}`);
         if (response.status === 200) {
            fetchOrderDetails();
            messageToast.success('Cập nhật trạng thái đơn hàng thành công');
         }

      } catch (error) {
         console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
         messageToast.error('Cập nhật trạng thái đơn hàng thất bại');
      }
   }
   const handleSyncGHN = async () => {
      setIsSyncing(true);
      try {
         const response = await api.put(`/order/staff/sync-ghn-status/${orderId}`);
         if (response.status === 200) {
            const status: GhnStatusDTO = response.data?.data
            if (status.newStatus !== status.oldStatus) {
               fetchOrderDetails();
               messageToast.success('Đồng bộ trạng thái GHN thành công');
            } else if (status.newStatus === status.oldStatus) {
               messageToast.info('Trạng thái GHN không có thay đổi');
            }
         }

      } catch (error) {
         console.error('Lỗi khi đồng bộ dữ liệu GHN:', error);
      } finally {
         setIsSyncing(false);
      }
   }

   return (
      <div className="p-6 space-y-6">
         {/* Header */}
         <div className="flex justify-between items-center border-1 border-[#E5E5E5] rounded-2xl px-6 py-4 shadow-md bg-white">
            <div>
               <h1 className="text-2xl font-bold"># Order - {orderData?.orderId}</h1>
               <p className="text-gray-500 text-lg">Tạo lúc {formatDate(orderData?.createdAt)}</p>
            </div>
            <div className="flex gap-2">
               <p className="bg-[#666666] cursor-default text-white px-4 py-1 rounded-full text-base flex items-center">{statusMap[orderData?.status]?.label}</p>
               <Button onClick={handlePrepareOrder} icon={<Box size={16} />} className={`${orderData?.status == 'Confirmed' ? 'cursor-pointer' : 'opacity-50 !cursor-not-allowed'} !border-[#E5E5E5] !text-base !text-black !hover:text-black`} size="large">Đã chuẩn bị hàng</Button>
               <Button
                  onClick={handleSyncGHN}
                  disabled={isSyncing || (orderData?.status !== 'Packed' && orderData?.status !== 'Delivering' && orderData?.status !== 'Returning')}
                  icon={<RefreshCcw size={16} />}
                  className={`${orderData?.status == 'Packed' || orderData?.status == 'Delivering' || orderData?.status == 'Returning' ? 'cursor-pointer' : 'opacity-50 !cursor-not-allowed'} !border-[#E5E5E5] !text-base !text-black !hover:text-black`}
                  size="large"
               >
                  Đồng bộ dữ liệu GHN
               </Button>
            </div>
         </div>

         {/* Status Steps */}
         <div className="px-6 py-4 border-1 border-[#E5E5E5] rounded-2xl shadow-md bg-white">
            <div className="mb-5 font-bold text-xl text-black">
               Trạng thái & Tiến trình
            </div>
            <Steps size="default" current={currentStep} labelPlacement="vertical" items={items} />
         </div>

         {/* Customer & Address */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Khách hàng */}
            <div className="px-6 py-4 border-1 border-[#E5E5E5] rounded-2xl shadow-md bg-white">
               <h2 className="font-bold text-xl text-black pb-3">Khách hàng</h2>
               <div className="space-y-2 text-base">
                  <div className="flex justify-between border-b pb-1">
                     <span className="text-gray-500">Tên</span>
                     <span className="font-medium">{orderData?.customerName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                     <span className="text-gray-500">SĐT</span>
                     <span className="font-medium">{orderData?.customerPhone}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                     <span className="text-gray-500">Email</span>
                     <span className="font-medium">{orderData?.customerEmail}</span>
                  </div>
               </div>
            </div>

            {/* Địa chỉ giao hàng */}
            <div className="px-6 py-4 border-1 border-[#E5E5E5] rounded-2xl shadow-md bg-white">
               <h2 className="font-bold text-xl text-black pb-3">Thông tin người nhận</h2>
               <div className="space-y-2 text-base">
                  <div className="flex justify-between border-b pb-1">
                     <span className="text-gray-500">Người nhận</span>
                     <span className="font-medium">{orderData?.receiverName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                     <span className="text-gray-500">Địa chỉ</span>
                     <span className="flex-1 font-medium text-right w-[60%]">
                        {orderData?.receiverAddress}
                     </span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-gray-500">Điện thoại</span>
                     <span className="font-medium">{orderData?.receiverPhone}</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Product List */}
         <div className="px-6 py-4 border-1 border-[#E5E5E5] rounded-2xl shadow-md bg-white">
            <h2 className="font-bold text-xl text-black pb-3">Tóm tắt sản phẩm</h2>
            <Table
               columns={columns}
               dataSource={orderData?.orderDetails}
               pagination={false}
               size="small"
            />
            <p className="text-left text-base mt-5 px-2">
               Số lượng sản phẩm: {orderData?.totalQuantity}
            </p>
         </div>

         {/* Payment & Total */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Thanh toán */}
            <div className="px-6 py-4 border-1 border-[#E5E5E5] rounded-2xl shadow-md bg-white">
               <h2 className="font-bold mb-3 text-xl">Thanh toán</h2>
               <table className="w-full text-base border-collapse">
                  <tbody>
                     <tr className="border-b">
                        <td className="py-2 font-medium text-gray-600 w-1/3">Phương thức</td>
                        <td className="py-2 text-gray-800">{orderData?.paymentMethod}</td>
                     </tr>
                     <tr className="border-b">
                        <td className="py-2 font-medium text-gray-600">Trạng thái</td>
                        <td className="py-2">
                           <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}>
                              {statusInfo.text}
                           </span>
                        </td>
                     </tr>
                     <tr>
                        <td className="py-2 font-medium text-gray-600">Ngày thanh toán</td>
                        <td className="py-2 text-gray-800">{orderData?.paymentDate ? formatDate(orderData.paymentDate) : ''}</td>
                     </tr>
                  </tbody>
               </table>
            </div>

            {/* Tổng cộng */}
            <div className="px-6 py-4 border-1 border-[#E5E5E5] rounded-2xl shadow-md bg-white">
               <h2 className="font-bold mb-3 text-xl">Tổng cộng</h2>
               <table className="w-full text-base border-collapse">
                  <tbody>
                     <tr className="border-b">
                        <td className="py-2 font-medium text-gray-600 w-1/3">Tạm tính</td>
                        <td className="py-2 text-gray-800">{orderData?.amount ? `${formatPrice(orderData.amount)}đ` : ''}</td>
                     </tr>
                     <tr className="border-b">
                        <td className="py-2 font-medium text-gray-600">Phí vận chuyển</td>
                        <td className="py-2 text-gray-800">{orderData?.shippingMoney ? `${formatPrice(orderData.shippingMoney)}đ` : ''}</td>
                     </tr>
                     {(orderData?.insuranceFee ?? 0) > 0 && (
                        <tr className="border-b">
                           <td className="py-2 font-medium text-gray-600">Phí bảo hiểm</td>
                           <td className=" py-2 text-gray-800">{formatPrice(orderData?.insuranceFee ?? 0)} đ</td>
                        </tr>
                     )}
                     <tr>
                        <td className="py-2 font-medium text-gray-600">Tổng thanh toán</td>
                        <td className="py-2 text-gray-900 font-semibold">
                           {orderData?.totalWithShippingMoney ? `${formatPrice(orderData.totalWithShippingMoney)}đ` : ''}
                        </td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </div>


         {/* Shipping */}
         <div className="px-6 py-4 border-1 border-[#E5E5E5] rounded-2xl shadow-md bg-white">
            <h2 className="font-bold mb-3 text-xl">Vận chuyển & Theo dõi</h2>
            <table className="w-full text-base border-collapse">
               <tbody>
                  <tr className="border-b">
                     <td className="py-2 font-medium text-gray-600">Mã vận đơn</td>
                     <td className="py-2 text-gray-800">{orderData?.shippingCode}</td>
                  </tr>
                  <tr>
                     <td className="py-2 font-medium text-gray-600">Dự kiến giao hàng</td>
                     <td className="py-2 text-gray-800">{orderData?.estimatedDelivery ? formatDate(orderData.estimatedDelivery) : ''}</td>
                  </tr>
               </tbody>
            </table>
         </div>

      </div>
   );
}