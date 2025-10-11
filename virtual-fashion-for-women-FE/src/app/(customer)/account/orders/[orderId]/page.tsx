'use client';
import { api } from "@/api/instance";
import statusMap from "@/helpers/statusMapper";
import { messageToast } from "@/helpers/toastHelper";
import { OrderDTO } from "@/models/OrderDTO";
import formatDate from "@/utils/formatDate";
import formatPrice from "@/utils/formatPrice";
import { Calendar, Copy, Icon, Mail, Phone, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OrderDetailPage() {
    const route = useRouter();
    const params = useParams() as { orderId: string };
    const orderId = parseInt(params.orderId);

    const [order, setOrder] = useState<OrderDTO>();
    const [statusPaymentInformation, setStatusPaymentInformation] = useState<any>({});
    const [statusOrderInformation, setStatusOrderInformation] = useState<any>({});

    const fetchOrderDetails = async (orderId: number) => {
        try {
            const response = await api.get(`/my-order/${orderId}`);
            if (response.status === 200) {
                const data: OrderDTO = response.data
                setOrder(data);
                setStatusPaymentInformation(statusMap[data.transactionInformation.status]);
                setStatusOrderInformation(statusMap[data.status]);
            } else {
                messageToast.error("Lỗi khi lấy chi tiết đơn hàng");
            }
        } catch (error: any) {
            messageToast.error("Lỗi khi lấy chi tiết đơn hàng: ", error);
            setOrder(undefined);
            route.back
        }
    }
    useEffect(() => {
        if (orderId)
            fetchOrderDetails(orderId);
    }, [orderId]);

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-4">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white shadow-sm rounded-xl p-4">
                    <div className="flex flex-col gap-2 text-gray-700">
                        <h1 className="font-bold text-2xl text-black">#ORD-{orderId}</h1>

                        <div className="flex items-center gap-2 text-base text-gray-500">
                            <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                Tạo lúc: {formatDate(order?.createdAt)}
                            </span>
                            <span>• {order?.responseOrderDetails.length} Sản phẩm</span>
                        </div>
                        <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-sm font-medium border border-gray-200 bg-gray-100 w-fit"
                        >
                            {statusOrderInformation.icon && (
                                <statusOrderInformation.icon
                                    size={18} className="m-1"
                                />
                            )}
                            <span className="text-sm font-medium" >
                                {statusOrderInformation.label}
                            </span>
                        </span>

                    </div>

                    <button
                        className="mt-3 sm:mt-0 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-all"
                        onClick={() => {
                            route.back()
                        }}
                    >
                        Quay lại
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-bold mb-4">Khách hàng</h2>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-gray-400" />
                                <span>{order?.userInformation.fullName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span>{order?.userInformation.phoneNumber}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span>{order?.userInformation.email}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-bold mb-2">Địa chỉ giao hàng</h2>
                        <div className="space-y-2">
                            <p className="text-sm ">{order?.receiverName}</p>
                            <p className="text-sm ">{order?.receiverAddress}</p>
                            <p className="text-sm ">Điện thoại: {order?.receiverPhone}</p>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4">Tóm tắt sản phẩm</h2>
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
                                {order?.responseOrderDetails.map((product) => (
                                    <tr
                                        key={product.orderDetailId}
                                        className="border-b hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="py-4 px-2">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                                                    <img
                                                        src={product.responseProductVariantDto.imageUrl}
                                                        alt={product.responseProductVariantDto.variantName}
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className=" text-gray-800 leading-tight">
                                                        {product.responseProductVariantDto.variantName}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-4 text-sm text-gray-800 text-center pr-4">
                                            {product.responseProductVariantDto.colorDto?.colorName}
                                        </td>

                                        <td className="py-4 text-sm text-center pr-4">
                                            <div className="flex items-center justify-center gap-1 text-gray-800">
                                                <span>
                                                    {product.responseProductVariantDto.sizeDto?.sizeCode}
                                                </span>
                                            </div>
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
                    <p className="text-sm text-gray-500 mt-4">Số lượng sản phẩm: {order?.responseOrderDetails.length}</p>
                </div>

                {/* Payment and Summary */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-bold mb-4">Thanh toán</h2>
                        <div className="space-y-3 mb-6">
                            <div>
                                <p className="font-medium text-black italic">Phương thức</p>
                                <p>{order?.transactionInformation.method}</p>
                            </div>
                            <div>
                                <p className="font-medium text-black italic">Mã giao dịch</p>
                                <p >{order?.transactionInformation.transactionCode}</p>
                            </div>
                            <div>
                                <p className="font-medium text-black italic">Trạng thái</p>
                                <span
                                    className={`inline-flex items-center p-2 rounded-full text-sm font-medium border-gray-200 bg-gray-100 text-gray-800`}
                                    style={{ color: statusPaymentInformation.color }}
                                >
                                    {statusPaymentInformation.label}
                                </span>

                            </div>
                            <div>
                                <p className="font-medium text-black italic">Thời gian thanh toán</p>
                                <p>{formatDate(order?.transactionInformation.updatedAt)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-bold mb-4">Tổng cộng</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-base">
                                <span className="text-gray-600">Tạm tính</span>
                                <span className="font-bold">{formatPrice(order?.responseOrderDetails.reduce((acc, item) => acc + item.priceAtTime * item.quantity, 0) ?? 0)} đ</span>
                            </div>

                            <div className="flex justify-between text-base">
                                <span className="text-gray-600">Phí vận chuyển</span>
                                <span className="font-bold">{formatPrice(order?.shippingMoney ?? 0)} đ</span>
                            </div>
                            {(order?.insuranceFee ?? 0) > 0 && (
                                <div className="flex justify-between text-base">
                                    <span className="text-gray-600">Phí bảo hiểm</span>
                                    <span className=" font-bold">{formatPrice(order?.insuranceFee ?? 0)} đ</span>
                                </div>
                            )}
                            <div className="border-t pt-3 mt-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold">Tổng thanh toán</span>
                                    <span className="font-bold">{formatPrice(order?.amount ?? 0)} đ</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                    <h2 className="text-2xl font-bold mb-2">Vận chuyển & Theo dõi</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <p className=" text-black mb-1 italic">Phương thức</p>
                            <p>GHN</p>
                        </div>

                        <div>
                            <p className=" text-black mb-1 italic">Mã vận đơn</p>
                            <div className="flex items-center gap-2">
                                <p >{order?.shippingCode}</p>
                            </div>
                        </div>

                        <div>
                            <p className=" text-black mb-1 italic">Dự kiến giao hàng</p>
                            <p>{order?.estimatedDelivery}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
