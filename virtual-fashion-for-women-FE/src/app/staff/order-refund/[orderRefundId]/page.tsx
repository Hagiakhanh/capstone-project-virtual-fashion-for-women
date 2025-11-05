"use client";

import { Table, Steps, Button, Radio, Modal, Input, Form } from "antd";
import { ArchiveRestore, CircleDollarSign, RefreshCcw } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import { useParams } from "next/navigation";
import { api } from "@/api/instance";
import { useEffect, useState } from "react";
import formatDate from "@/utils/formatDate";
import formatPrice from "@/utils/formatPrice";
import { messageToast } from "@/helpers/toastHelper";
import { GhnStatusDTO } from "@/models/GhnDTO";
import { ItemRefundDetailDTO, OrderRefundDetailDTO } from "@/models/OrderRefundDTO";
import statusMapRefund from "@/helpers/statusMapperRefund";

export default function OrderRefundDetailsStaff() {
   const params = useParams();
   const [orderRefundData, setOrderRefundData] = useState<OrderRefundDetailDTO>();
   const orderRefundId = params.orderRefundId as string;
   const [previewVisible, setPreviewVisible] = useState(false);
   const [selectedImage, setSelectedImage] = useState<string | null>(null);
   // Modal phản hồi
   const [isModalVisible, setIsModalVisible] = useState(false);
   const [form] = Form.useForm();
   const [isSyncing, setIsSyncing] = useState<boolean>(false);

   const handlePreview = (img: string) => {
      setSelectedImage(img);
      setPreviewVisible(true);
   };

   const handleClose = () => {
      setPreviewVisible(false);
      setSelectedImage(null);
   };

   const handleCancel = () => {
      setIsModalVisible(false);
      form.resetFields();
   };

   const handleSubmit = async () => {
      try {
         const values = await form.validateFields();

         const payload = {
            orderRefundId: Number(orderRefundId),
            statusEnum: Number(values?.decision),
            staffResponse: values?.reason,
         }
         const response = await api.put('/orderRefund/staff', payload);
         if (response.status === 200) {
            messageToast.success("Phản hồi yêu cầu hoàn trả thành công");
            fetchOrderRefundDetails();
         } else {
            messageToast.error("Phản hồi yêu cầu hoàn trả thất bại");
         }

         setIsModalVisible(false);
      } catch (error) {
         // Nếu validate lỗi thì antd sẽ tự hiển thị, không cần xử lý thêm
      }
   };

   const handleRefundMoney = async () => {
      try {
         const response = await api.put(`/orderRefund/staff/refund-money/${orderRefundId}`);
         if (response.status === 200) {
            messageToast.success("Hoàn tiền thành công");
            fetchOrderRefundDetails();
         } else {
            messageToast.error("Hoàn tiền thất bại");
         }
      } catch (error) {
         console.log("Lỗi hoàn tiền:", error);
      }
   }

   const fetchOrderRefundDetails = async () => {
      try {
         if (!orderRefundId) {
            return;
         }
         const response = await api.get(`/orderRefund/staff/${orderRefundId}`);
         if (response.status === 200) {
            console.log("Chi tiết đơn hàng:", response.data?.data);
            setOrderRefundData(response.data?.data);
         }

      } catch (error: any) {
         console.log("Lỗi lấy chi tiết hoàn trả:", error);
      }
   }

   const handleSyncGHN = async () => {
      setIsSyncing(true);
      try {
         const response = await api.put(`/orderRefund/staff/sync-ghn-status/${orderRefundId}`);
         if (response.status === 200) {
            const status: GhnStatusDTO = response.data?.data
            if (status.newStatus !== status.oldStatus) {
               fetchOrderRefundDetails();
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

   useEffect(() => {
      fetchOrderRefundDetails();
   }, [orderRefundId]);

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
   const statusInfo = getPaymentStatusInfo(orderRefundData?.transactionStatus as 'Pending' | 'Success' | 'Failed' | undefined);

   const items = [
      {
         title: "Chờ xác nhận",
      },
      {
         title: 'Đã xác nhận',
      },
      {
         title: 'Đang hoàn hàng',
      },
      {
         title: 'Đã hoàn hàng',
      },
      {
         title: 'Hoàn tất',
      },
      {
         title: 'Từ chối yêu cầu',
      }
   ];

   const columns: ColumnsType<ItemRefundDetailDTO> = [
      {
         title: "Sản phẩm",
         dataIndex: "variantName",
         key: "variantName",
         render: (text, record) => (
            console.log(record),
            <div className="flex items-center space-x-3">
               {/* Hình ảnh sản phẩm (variantImage) */}
               <img
                  src={record.variantImage}
                  alt={record.variantName}
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
         dataIndex: "variantSize",
         key: "variantSize",
         align: "center",
      },
      {
         title: "Màu sắc",
         dataIndex: "variantColor",
         key: "variantColor",
         align: "center",
      },
      {
         title: "Giá",
         dataIndex: "variantPrice",
         key: "variantPrice",
         align: "center",
         render: (value, record: ItemRefundDetailDTO) => (
            <span>{record?.variantPrice ? formatPrice(record?.variantPrice) : ''}đ</span>
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
         dataIndex: "variantAmount",
         key: "variantAmount",
         align: "center",
         render: (value, record) => (
            <span>{formatPrice(value)}đ</span>
         )
      },
   ];

   const getStatusText = (status: string | undefined) => {
      switch (status) {
         case 'Pending': return 'Chờ xác nhận';
         case 'Accepted': return 'Đã xác nhận';
         case 'Delivering': return 'Đang hoàn hàng';
         case 'Delivered': return 'Đã hoàn hàng';
         case 'Completed': return 'Hoàn tất';
         case 'Rejected': return 'Từ chối yêu cầu';
         default: return status || 'Không rõ';
      }
   };

   const currentStatusText = getStatusText(orderRefundData?.orderRefundStatus);
   const currentStepIndex = items.findIndex(item => item.title === currentStatusText);
   const currentStep = currentStepIndex !== -1 ? currentStepIndex : 0;

   const orderRefundStatus = statusMapRefund[orderRefundData?.orderRefundStatus || ''];

   return (
      <div className="p-6 space-y-6">
         {/* Header */}
         <div className="flex justify-between items-center border-1 border-[#E5E5E5] rounded-2xl px-6 py-4 shadow-md bg-white">
            <div>
               <h1 className="text-2xl font-bold"># Refund - {orderRefundData?.orderRefundId}</h1>
               <p className="text-gray-500 text-lg">Tạo lúc {formatDate(orderRefundData?.createdAt)}</p>
            </div>
            <div className="flex gap-2">
               <p className="bg-[#666666] cursor-default text-white px-4 py-1 rounded-full text-base flex items-center">{orderRefundStatus?.label}</p>
               <Button
                  onClick={() => setIsModalVisible(true)} icon={<ArchiveRestore size={16} />}
                  className={`${orderRefundData?.orderRefundStatus == 'Pending' ? 'cursor-pointer' : 'opacity-50 !cursor-not-allowed'} !border-[#E5E5E5] !text-base !text-black !hover:text-black`} size="large"
                  disabled={orderRefundData?.orderRefundStatus !== 'Pending'}
               >
                  Phản hồi yêu cầu
               </Button>
               <Button
                  onClick={handleSyncGHN}
                  disabled={isSyncing || (orderRefundData?.orderRefundStatus !== 'Accepted' && orderRefundData?.orderRefundStatus !== 'Delivering')}
                  icon={<RefreshCcw size={16} />}
                  className={`${orderRefundData?.orderRefundStatus == 'Accepted' || orderRefundData?.orderRefundStatus == 'Delivering' ? 'cursor-pointer' : 'opacity-50 !cursor-not-allowed'} !border-[#E5E5E5] !text-base !text-black !hover:text-black`}
                  size="large"
               >
                  Đồng bộ dữ liệu GHN
               </Button>
               <Button
                  onClick={handleRefundMoney}
                  icon={<CircleDollarSign size={16} />}
                  className={`${orderRefundData?.orderRefundStatus == 'Delivered' ? 'cursor-pointer' : 'opacity-50 !cursor-not-allowed'} !border-[#E5E5E5] !text-base !text-black !hover:text-black`} size="large"
                  disabled={orderRefundData?.orderRefundStatus !== 'Delivered'}
               >
                  Hoàn tiền
               </Button>
            </div>
         </div>

         {/* Modal phản hồi */}
         <Modal
            title={<span style={{ fontSize: '20px' }}>Phản hồi yêu cầu hoàn hàng</span>}
            open={isModalVisible}
            onCancel={handleCancel}
            onOk={handleSubmit}
            okText="Xác nhận"
            cancelText="Hủy"
            centered
         >
            <Form
               form={form}
               layout="vertical"
               className="space-y-4"
            >
               {/* Quyết định xử lý */}
               <Form.Item
                  label={<span style={{ fontSize: '16px' }}>Bạn muốn xử lý yêu cầu này như thế nào</span>}
                  name="decision"
                  rules={[{ required: true, message: "Vui lòng chọn hành động xử lý." }]}
               >
                  <Radio.Group>
                     <Radio value="1">Đồng ý hoàn hàng</Radio>
                     <Radio value="2">Từ chối hoàn hàng</Radio>
                  </Radio.Group>
               </Form.Item>

               {/* Lý do phản hồi */}
               <Form.Item
                  label={<span style={{ fontSize: '16px' }}>Phản hồi của nhân viên:</span>}
                  name="reason"
                  rules={[{ required: true, message: "Vui lòng nhập lý do phản hồi." }]}
               >
                  <Input.TextArea
                     rows={4}
                     placeholder="Nhập lý do phản hồi..."
                  />
               </Form.Item>
            </Form>
         </Modal>

         {/* Status Steps */}
         <div className="px-6 py-4 border-1 border-[#E5E5E5] rounded-2xl shadow-md bg-white">
            <div className="mb-5 font-bold text-xl text-black">
               Trạng thái & Tiến trình
            </div>
            <Steps size="default" current={currentStep} labelPlacement="vertical" items={items} />
         </div>

         {/* Hình ảnh và lý do */}
         <div className="px-6 py-4 border-1 border-[#E5E5E5] rounded-2xl shadow-md bg-white">
            <h2 className="font-bold text-xl text-black pb-3">Hình ảnh & Lý do hoàn hàng</h2>

            {/* Lý do hoàn hàng */}
            <div className="mb-4">
               <p className="text-base text-gray-600 mb-1">Lý do từ khách hàng:</p>
               <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-gray-800 leading-relaxed">
                     {orderRefundData?.customerReason}
                  </p>
               </div>
            </div>

            {/* Danh sách hình ảnh */}
            <div className="mb-4">
               <p className="text-base text-gray-600 mb-2">Hình ảnh minh chứng:</p>
               <div className="flex flex-wrap gap-3">
                  {orderRefundData?.customerImage?.map((img, index) => (
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

            {/* Nhân viên phản hồi */}
            <div className="mb-4">
               <p className="text-base text-gray-600 mb-1">Phản hồi từ nhân viên:</p>
               <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-gray-800 leading-relaxed">
                     {orderRefundData?.staffResponse || 'Chưa có phản hồi từ nhân viên.'}
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

         {/* Customer & Address */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Khách hàng */}
            <div className="px-6 py-4 border-1 border-[#E5E5E5] rounded-2xl shadow-md bg-white">
               <h2 className="font-bold text-xl text-black pb-3">Khách hàng</h2>
               <div className="space-y-2 text-base">
                  <div className="flex justify-between border-b pb-1">
                     <span className="text-gray-500">Tên</span>
                     <span className="font-medium">{orderRefundData?.customerName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                     <span className="text-gray-500">SĐT</span>
                     <span className="font-medium">{orderRefundData?.customerPhone || 'Chưa có thông tin'}</span>
                  </div>
                  <div className="flex justify-between pb-1">
                     <span className="text-gray-500">Email</span>
                     <span className="font-medium">{orderRefundData?.customerEmail || 'Chưa có thông tin'}</span>
                  </div>
               </div>
            </div>

            {/* Địa chỉ giao hàng */}
            <div className="px-6 py-4 border-1 border-[#E5E5E5] rounded-2xl shadow-md bg-white">
               <h2 className="font-bold text-xl text-black pb-3">Thông tin người nhận</h2>
               <div className="space-y-2 text-base">
                  <div className="flex justify-between border-b pb-1">
                     <span className="text-gray-500">Người nhận</span>
                     <span className="font-medium">{orderRefundData?.receiverName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                     <span className="text-gray-500">Địa chỉ</span>
                     <span className="flex-1 font-medium text-right w-[60%]">
                        {orderRefundData?.receiverAddress || 'Chưa có thông tin'}
                     </span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-gray-500">Điện thoại</span>
                     <span className="font-medium">{orderRefundData?.receiverPhone || 'Chưa có thông tin'}</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Product List */}
         <div className="px-6 py-4 border-1 border-[#E5E5E5] rounded-2xl shadow-md bg-white">
            <h2 className="font-bold text-xl text-black pb-3">Tóm tắt sản phẩm</h2>
            <Table
               columns={columns}
               dataSource={orderRefundData?.items}
               pagination={false}
               size="small"
            />
            <p className="text-left text-base mt-5 px-2">
               Số lượng sản phẩm: {orderRefundData?.productCount}
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
                        <td className="py-2 text-gray-800">Hoàn tiền về ví</td>
                     </tr>
                     <tr className="border-b">
                        <td className="py-2 font-medium text-gray-600">Trạng thái</td>
                        <td className="py-2">
                           <span
                              className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}
                           >
                              {statusInfo.text}
                           </span>
                        </td>
                     </tr>
                     <tr>
                        <td className="py-2 font-medium text-gray-600">Ngày thanh toán</td>
                        <td className="py-2 text-gray-800">{formatDate(orderRefundData?.transactionTime || '') || 'Chưa có thông tin'}</td>
                     </tr>
                  </tbody>
               </table>
            </div>

            {/* Tổng cộng */}
            <div className="px-6 py-4 border-1 border-[#E5E5E5] rounded-2xl shadow-md bg-white">
               <h2 className="font-bold mb-3 text-xl">Số tiền hoàn lại</h2>
               <table className="w-full text-base border-collapse">
                  <tbody>
                     <tr className="border-b">
                        <td className="py-2 font-medium text-gray-600 w-1/3">Tạm tính</td>
                        <td className="py-2 text-gray-800">{formatPrice(orderRefundData?.amount || 0)} đ</td>
                     </tr>
                     {/* <tr className="border-b">
                        <td className="py-2 font-medium text-gray-600">Phí vận chuyển</td>
                        <td className="py-2 text-gray-800">{orderData?.shippingMoney ? `${formatPrice(orderData.shippingMoney)}đ` : ''}</td>
                     </tr> */}
                     <tr>
                        <td className="py-2 font-medium text-gray-600">Tổng thanh toán</td>
                        <td className="py-2 text-gray-900 font-semibold">
                           {formatPrice(orderRefundData?.amount || 0)} đ
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
                     <td className="py-2 text-gray-800">{orderRefundData?.shippingCode || 'Chưa có thông tin'}</td>
                  </tr>
                  <tr>
                     <td className="py-2 font-medium text-gray-600">Dự kiến giao hàng</td>
                     <td className="py-2 text-gray-800"></td>
                  </tr>
               </tbody>
            </table>
         </div>

      </div>
   );
}