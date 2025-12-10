'use client';
import { api } from "@/api/instance";
import statusMap from "@/helpers/statusMapper";
import { messageToast } from "@/helpers/toastHelper";
import { OrderDTO } from "@/models/OrderDTO";
import formatDate from "@/utils/formatDate";
import formatPrice from "@/utils/formatPrice";
import { Calendar, Mail, Phone, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Modal, Input, Upload as AntUpload, Button, Checkbox, Form, Upload } from "antd";

export default function OrderDetailPage() {
    const route = useRouter();
    const params = useParams() as { orderId: string };
    const orderId = parseInt(params.orderId);

    const [order, setOrder] = useState<OrderDTO>();
    const [statusPaymentInformation, setStatusPaymentInformation] = useState<any>({});
    const [statusOrderInformation, setStatusOrderInformation] = useState<any>({});
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form] = Form.useForm();
    const [checkCanRefund, setCheckCanRefund] = useState<boolean>(false);
    const [showConfirmCompleteModal, setShowConfirmCompleteModal] = useState(false);
    const [checkCanComplete, setCheckCanComplete] = useState<boolean>(false);

    const fetchOrderDetails = async (orderId: number) => {
        try {
            const response = await api.get(`/my-order/${orderId}`);
            if (response.status === 200) {
                const data: OrderDTO = response.data
                setOrder(data);
                setStatusPaymentInformation(statusMap[data.transactionInformations[0]?.status]);
                setStatusOrderInformation(statusMap[data.status]);
            } else {
                messageToast.error("Lỗi khi lấy chi tiết đơn hàng");
            }
        } catch (error: any) {
            messageToast.error("Lỗi khi lấy chi tiết đơn hàng: " + error.response?.data?.message);
            setOrder(undefined);
            route.back
        }
    }

    const fetchCheckCanRefund = async (orderId: number) => {
        try {
            const response = await api.get(`/order/can-refund/${orderId}`);
            if (response.status === 200) {
                setCheckCanRefund(true);
            } else {
                setCheckCanRefund(false);
            }
        } catch (error) {
            console.log("Lỗi khi kiểm tra hoàn hàng: ", error);
            setCheckCanRefund(false);
        }
    }

    const fetchCheckCanComplete = async (orderId: number) => {
        try {
            const response = await api.get(`/order/can-complete/${orderId}`);
            if (response.status === 200) {
                setCheckCanComplete(true);
            } else {
                setCheckCanComplete(false);
            }
        } catch (error) {
            console.log("Lỗi khi kiểm tra hoàn hàng: ", error);
            setCheckCanComplete(false);
        }
    }

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails(orderId);
            fetchCheckCanRefund(orderId);
            fetchCheckCanComplete(orderId);
        }
    }, [orderId]);

    const beforeUpload = (file: any, fileList: any) => {
        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            return Upload.LIST_IGNORE;
        }
        return false;
    };

    const handleSubmitRefund = async (values: any) => {
        try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append("OrderID", orderId.toString());
            formData.append("CustomerReason", values.CustomerReason);

            values.ImageUrl?.fileList.forEach((file: any) => {
                formData.append("ImageUrl", file.originFileObj);
            });

            values.SelectedItems.forEach((id: number, index: number) => {
                formData.append(`Items[${index}].OrderDetailID`, id.toString());
            });

            const response = await api.post('/orderRefund', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                messageToast.success("Yêu cầu hoàn hàng đã được gửi thành công");
                form.resetFields();
                setShowRefundModal(false);
            } else {
                messageToast.error("Lỗi không thể gửi yêu cầu hoàn hàng");
            }

        } catch (error) {
            messageToast.error("Lỗi không thể gửi yêu cầu hoàn hàng");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleCompleteOrder = async () => {
        try {
            const response = await api.put(`/order/complete/${orderId}`);
            if (response.status === 200) {
                messageToast.success("Đơn hàng đã được hoàn tất.");
                fetchOrderDetails(orderId);
                fetchCheckCanRefund(orderId);
                fetchCheckCanComplete(orderId);
            }

        } catch (error) {
            console.log("Lỗi khi hoàn tất đơn hàng: ", error);
            messageToast.error("Lỗi khi hoàn tất đơn hàng.");
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 p-3 md:p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header - Responsive */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 md:mb-6 bg-white shadow-sm rounded-xl p-4 md:p-5">
                    <div className="flex flex-col gap-2 text-gray-700 flex-1 min-w-0">
                        <h1 className="font-bold text-xl md:text-2xl text-black truncate">#ORD-{orderId}</h1>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs md:text-base text-gray-500">
                            <span className="flex items-center gap-1">
                                <Calendar size={14} className="flex-shrink-0" />
                                <span className="truncate">Tạo lúc: {formatDate(order?.createdAt)}</span>
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span>{order?.responseOrderDetails.length} Sản phẩm</span>
                        </div>

                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs md:text-sm font-medium border border-gray-200 bg-gray-100 w-fit">
                            {statusOrderInformation.icon && (
                                <statusOrderInformation.icon size={16} className="mr-1 md:mr-1.5" />
                            )}
                            <span className="text-xs md:text-sm font-medium">
                                {statusOrderInformation.label}
                            </span>
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        {checkCanRefund && (
                            <Button
                                type="primary"
                                size="middle"
                                className="!bg-red-500 hover:!bg-red-600 !text-white rounded-lg text-xs md:text-sm font-medium transition-all w-full sm:w-auto"
                                onClick={() => setShowRefundModal(true)}
                            >
                                Yêu cầu hoàn hàng
                            </Button>
                        )}

                        {checkCanComplete && (
                            <Button
                                type="default"
                                size="middle"
                                className="!border-green-500 !text-green-600 rounded-lg text-xs md:text-sm font-medium transition-all w-full sm:w-auto"
                                onClick={() => setShowConfirmCompleteModal(true)}
                            >
                                Nhận hàng
                            </Button>
                        )}

                        <Button
                            size="middle"
                            className="mt-3 sm:mt-0 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-all"
                            onClick={() => {
                                route.back()
                            }}
                        >
                            Quay lại
                        </Button>
                    </div>

                    {/* Modals */}
                    <Modal
                        title={<span className="font-semibold text-lg md:text-xl">Xác nhận đã nhận hàng</span>}
                        open={showConfirmCompleteModal}
                        onCancel={() => setShowConfirmCompleteModal(false)}
                        footer={null}
                        centered
                    >
                        <p className="text-sm md:text-base text-gray-700 mb-4">
                            Sau khi xác nhận đã nhận hàng, bạn sẽ <b>không thể tạo yêu cầu hoàn hàng</b> cho đơn này nữa.
                            Bạn có chắc chắn muốn tiếp tục không?
                        </p>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button onClick={() => setShowConfirmCompleteModal(false)}>Hủy</Button>
                            <Button
                                type="primary"
                                className="!bg-green-600 !text-white"
                                onClick={async () => {
                                    await handleCompleteOrder();
                                    setShowConfirmCompleteModal(false);
                                }}
                            >
                                Xác nhận
                            </Button>
                        </div>
                    </Modal>

                    <Modal
                        title={<span className="font-semibold text-lg md:text-xl">Tạo yêu cầu hoàn hàng</span>}
                        open={showRefundModal}
                        onCancel={() => setShowRefundModal(false)}
                        footer={null}
                        centered
                        width={window.innerWidth < 640 ? '95%' : 520}
                    >
                        <Form form={form} layout="vertical" onFinish={handleSubmitRefund} className="mt-2">
                            <Form.Item
                                label={<span className="text-sm md:text-base">Lý do hoàn hàng</span>}
                                name="CustomerReason"
                                rules={[{ required: true, message: "Vui lòng nhập lý do hoàn hàng" }]}
                            >
                                <Input.TextArea className="!text-sm md:!text-base" rows={3} placeholder="Nhập lý do hoàn hàng..." />
                            </Form.Item>

                            <Form.Item
                                label={<span className="text-sm md:text-base">Hình ảnh minh chứng (tối đa 4 hình ảnh)</span>}
                                name="ImageUrl"
                                rules={[{ required: true, message: "Vui lòng tải lên hình ảnh minh chứng" }]}
                            >
                                <AntUpload
                                    listType="picture"
                                    accept="image/*"
                                    beforeUpload={beforeUpload}
                                    multiple
                                    maxCount={4}
                                >
                                    <Button icon={<Upload />}>Tải hình ảnh</Button>
                                </AntUpload>
                            </Form.Item>

                            <Form.Item
                                label={<span className="text-sm md:text-base">Chọn sản phẩm muốn hoàn</span>}
                                name="SelectedItems"
                                rules={[
                                    {
                                        required: true,
                                        validator: (_, value) =>
                                            value && value.length > 0
                                                ? Promise.resolve()
                                                : Promise.reject(new Error("Vui lòng chọn ít nhất một sản phẩm")),
                                    },
                                ]}
                            >
                                <Checkbox.Group className="w-full">
                                    <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-2 w-full">
                                        {order?.responseOrderDetails.map((item) => (
                                            <Checkbox className="w-full text-sm" key={item.orderDetailId} value={item.orderDetailId}>
                                                {item.responseProductVariantDto.variantName}
                                            </Checkbox>
                                        ))}
                                    </div>
                                </Checkbox.Group>
                            </Form.Item>

                            <div className="flex justify-end gap-2 mt-4">
                                <Button onClick={() => {
                                    form.resetFields();
                                    setShowRefundModal(false);
                                }}>Hủy</Button>
                                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                    Gửi yêu cầu
                                </Button>
                            </div>
                        </Form>
                    </Modal>
                </div>

                {/* Customer & Shipping Info - Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                        <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4">Khách hàng</h2>
                        <div className="space-y-2 md:space-y-3">
                            <div className="flex items-center gap-2 text-xs md:text-sm">
                                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{order?.userInformation.fullName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs md:text-sm">
                                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span>{order?.userInformation.phoneNumber}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs md:text-sm">
                                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{order?.userInformation.email}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                        <h2 className="text-lg md:text-2xl font-bold mb-2 md:mb-3">Địa chỉ giao hàng</h2>
                        <div className="space-y-1 md:space-y-2">
                            <p className="text-xs md:text-sm">{order?.receiverName}</p>
                            <p className="text-xs md:text-sm">{order?.receiverAddress}</p>
                            <p className="text-xs md:text-sm">Điện thoại: {order?.receiverPhone}</p>
                        </div>
                    </div>
                </div>

                {/* Products Table - Responsive */}
                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-4 md:mb-6">
                    <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4">Tóm tắt sản phẩm</h2>

                    {/* Mobile: Card view */}
                    <div className="block md:hidden space-y-3">
                        {order?.responseOrderDetails.map((product) => (
                            <div key={product.orderDetailId} className="border rounded-lg p-3">
                                <div className="flex gap-3 mb-2">
                                    <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                        <img
                                            src={product.responseProductVariantDto.imageUrl}
                                            alt={product.responseProductVariantDto.variantName}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">
                                            {product.responseProductVariantDto.variantName}
                                        </p>
                                        <div className="flex gap-2 text-xs text-gray-600">
                                            <span>{product.responseProductVariantDto.colorDto?.colorName}</span>
                                            <span>•</span>
                                            <span>{product.responseProductVariantDto.sizeDto?.sizeCode}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-gray-500">Đơn giá:</span>
                                        <span className="font-medium ml-1">{formatPrice(product.priceAtTime)}đ</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">SL:</span>
                                        <span className="font-medium ml-1">{product.quantity}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-500">Tổng:</span>
                                        <span className="font-semibold ml-1">{formatPrice(product.priceAtTime * product.quantity)}đ</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop: Table view */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b">
                                <tr className="text-left text-sm text-gray-500">
                                    <th className="pb-3 font-medium">SẢN PHẨM</th>
                                    <th className="pb-3 pr-4 font-semibold text-[13px] tracking-wide text-center">MÀU</th>
                                    <th className="pb-3 pr-4 font-semibold text-[13px] tracking-wide text-center">SIZE</th>
                                    <th className="pb-3 font-medium text-right pl-4">GIÁ / SẢN PHẨM</th>
                                    <th className="pb-3 font-medium text-center pl-4">SỐ LƯỢNG</th>
                                    <th className="pb-3 font-medium text-right pl-4">TỔNG TIỀN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order?.responseOrderDetails.map((product) => (
                                    <tr key={product.orderDetailId} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-2">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                    <img
                                                        src={product.responseProductVariantDto.imageUrl}
                                                        alt={product.responseProductVariantDto.variantName}
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                                <span className="text-gray-800 leading-tight">
                                                    {product.responseProductVariantDto.variantName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-sm text-gray-800 text-center pr-4">
                                            {product.responseProductVariantDto.colorDto?.colorName}
                                        </td>
                                        <td className="py-4 text-sm text-center pr-4">
                                            <span className="text-gray-800">
                                                {product.responseProductVariantDto.sizeDto?.sizeCode}
                                            </span>
                                        </td>
                                        <td className="py-4 text-sm text-right font-medium text-gray-800 pl-4">
                                            {formatPrice(product.priceAtTime)} đ
                                        </td>
                                        <td className="py-4 text-sm text-center font-medium pl-4">
                                            {product.quantity}
                                        </td>
                                        <td className="py-4 text-sm text-right font-semibold text-gray-800 pl-4">
                                            {formatPrice(product.priceAtTime * product.quantity)} đ
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4">
                        Số lượng sản phẩm: {order?.responseOrderDetails.length}
                    </p>
                </div>

                {/* Payment and Summary - Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                        <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4">Thanh toán</h2>
                        <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                            <div>
                                <p className="font-medium text-black italic text-xs md:text-sm">Phương thức</p>
                                <p className="text-xs md:text-base">{order?.transactionInformations[0]?.method}</p>
                            </div>
                            <div>
                                <p className="font-medium text-black italic text-xs md:text-sm">Mã giao dịch</p>
                                <p className="text-xs md:text-base break-all">{order?.transactionInformations[0]?.transactionCode}</p>
                            </div>
                            <div>
                                <p className="font-medium text-black italic text-xs md:text-sm">Trạng thái</p>
                                <span
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs md:text-sm font-medium border-gray-200 bg-gray-100 text-gray-800"
                                    style={{ color: statusPaymentInformation.color }}
                                >
                                    {statusPaymentInformation.label}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium text-black italic text-xs md:text-sm">Thời gian thanh toán</p>
                                <p className="text-xs md:text-base">{formatDate(order?.transactionInformations[0]?.updatedAt)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                        <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4">Tổng cộng</h2>
                        <div className="space-y-2 md:space-y-3">
                            <div className="flex justify-between text-sm md:text-base">
                                <span className="text-gray-600">Tạm tính</span>
                                <span className="font-bold">{formatPrice(order?.responseOrderDetails.reduce((acc, item) => acc + item.priceAtTime * item.quantity, 0) ?? 0)} đ</span>
                            </div>
                            <div className="flex justify-between text-sm md:text-base">
                                <span className="text-gray-600">Phí vận chuyển</span>
                                <span className="font-bold">{formatPrice(order?.shippingMoney ?? 0)} đ</span>
                            </div>
                            {(order?.insuranceFee ?? 0) > 0 && (
                                <div className="flex justify-between text-sm md:text-base">
                                    <span className="text-gray-600">Phí bảo hiểm</span>
                                    <span className="font-bold">{formatPrice(order?.insuranceFee ?? 0)} đ</span>
                                </div>
                            )}
                            <div className="border-t pt-2 md:pt-3 mt-2 md:mt-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-base md:text-lg font-semibold">Tổng thanh toán</span>
                                    <span className="font-bold text-base md:text-lg">{formatPrice(order?.amount ?? 0)} đ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shipping Info - Responsive */}
                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mt-4 md:mt-6">
                    <h2 className="text-lg md:text-2xl font-bold mb-2 md:mb-3">Vận chuyển & Theo dõi</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
                        <div>
                            <p className="text-black mb-1 italic text-xs md:text-sm">Phương thức</p>
                            <p className="text-xs md:text-base">GHN</p>
                        </div>
                        <div>
                            <p className="text-black mb-1 italic text-xs md:text-sm">Mã vận đơn</p>
                            <p className="text-xs md:text-base break-all">{order?.shippingCode}</p>
                        </div>
                        <div>
                            <p className="text-black mb-1 italic text-xs md:text-sm">Dự kiến giao hàng</p>
                            <p className="text-xs md:text-base">{formatDate(order?.estimatedDelivery)}</p>
                        </div>
                    </div>
                </div>

                {/* Order Status Log - Responsive */}
                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mt-4 md:mt-6">
                    <h2 className="text-lg md:text-2xl font-bold mb-3 md:mb-4">Lịch sử trạng thái đơn hàng</h2>
                    {order?.responseStatusLogs && order.responseStatusLogs.length > 0 ? (
                        <div className="relative pl-4 md:pl-6 border-l-2 border-gray-200 space-y-4 md:space-y-6">
                            {order.responseStatusLogs
                                .sort((a, b) => new Date(a.updateDate).getTime() - new Date(b.updateDate).getTime())
                                .map((log, index) => (
                                    <div key={log.statusLogId} className="relative">
                                        <div
                                            className={`absolute -left-[9px] md:-left-[9px] top-1.5 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${index === order.responseStatusLogs.length - 1
                                                ? "bg-green-500"
                                                : "bg-gray-400"
                                                }`}
                                        ></div>
                                        <div className="ml-2">
                                            <p className="font-semibold text-gray-800 text-sm md:text-base">
                                                {statusMap[log.status]?.label || log.status}
                                            </p>
                                            <p className="text-xs md:text-sm text-gray-500">
                                                {formatDate(log.updateDate)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-xs md:text-sm">Chưa có lịch sử trạng thái</p>
                    )}
                </div>
            </div>
        </div>
    );
}