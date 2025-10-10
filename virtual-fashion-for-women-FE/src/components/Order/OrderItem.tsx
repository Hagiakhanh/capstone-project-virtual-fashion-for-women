'use client';

import { Calendar, Clock, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { OrderDTO } from '@/models/OrderDTO';
import formatPrice from '@/utils/formatPrice';
import statusMap from '@/helpers/statusMapper';
import { AntButtonCommon } from '../AntDesign/Button/AntButtonCommon';

interface OrderItemProps {
    order: OrderDTO;
}

export default function OrderItem({ order }: OrderItemProps) {
    const router = useRouter();
    const statusInfo = statusMap[order.status] || {
        label: 'Không xác định',
        color: '#7F8C8D',
        bg: '#ECF0F1',
        icon: Clock,
    };

    const StatusIcon = statusInfo.icon;

    const productCount = order.responseOrderDetails.length;
    const firstProduct = order.responseOrderDetails[0]?.responseProductVariantDto;
    const firstName = firstProduct?.variantName || 'Sản phẩm';

    return (
        <div className="w-full bg-white rounded-2xl shadow-sm border p-6 mb-4 hover:shadow-md transition-all">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="font-bold text-lg">
                            ORD-{order.orderId}
                        </span>
                        <div className="flex items-center gap-2">
                            <div
                                className="w-6 h-6 flex items-center justify-center rounded-full"
                                style={{ backgroundColor: statusInfo.bg }}
                            >
                                <StatusIcon size={16} color={statusInfo.color} />
                            </div>
                            <span
                                className="text-sm font-medium"
                                style={{ color: statusInfo.color }}
                            >
                                {statusInfo.label}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Calendar size={18} className="text-gray-400" />
                            <span>
                                {new Date(order.createdAt).toLocaleString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                })}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={18} className="text-gray-400" />
                            <span className="truncate max-w-xs sm:max-w-sm">
                                {order.receiverAddress}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="text-right ml-4 flex-shrink-0">
                    <div className="text-sm text-gray-500 mb-1 whitespace-nowrap">Tổng tiền</div>
                    <div className="text-black font-bold text-xl whitespace-nowrap">
                        {formatPrice(order.amount ?? 0)}đ
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4 bg-gray-50 rounded-xl p-4">
                {/* Left - Hình ảnh và mô tả sản phẩm */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex -space-x-3">
                        {order.responseOrderDetails.slice(0, 2).map((item, i) => (
                            <div
                                key={i}
                                className="w-14 h-14 rounded-lg border-2 border-white overflow-hidden bg-white shadow-sm relative"
                            >
                                <img
                                    src={item.responseProductVariantDto.imageUrl}
                                    alt={item.responseProductVariantDto.variantName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}

                        {productCount > 2 && (
                            <div className="w-14 h-14 rounded-lg border-2 border-white overflow-hidden bg-white shadow-sm relative">
                                <img
                                    src={order.responseOrderDetails[2].responseProductVariantDto.imageUrl}
                                    alt={order.responseOrderDetails[2].responseProductVariantDto.variantName}
                                    className="w-full h-full object-cover opacity-50"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">
                                        +{productCount - 2}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 mb-1 truncate">
                            {firstName}
                            {productCount > 1 && ` và ${productCount - 1} sản phẩm khác`}
                        </div>
                        <div className="text-sm text-gray-500">{productCount} sản phẩm</div>
                    </div>
                </div>

                {/* Right - Nút bấm */}
                <div className="flex flex-shrink-0 gap-2">
                    <button
                        onClick={() => router.push(`/orders/${order.orderId}`)}
                        className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-700 transition-all"
                    >
                        Xem chi tiết
                    </button>

                    {(order.status === 'Delivered' || order.status === 'Completed') && (
                        <button
                            onClick={() => console.log('Mua lại', order.orderId)}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50 transition-all"
                        >
                            Mua lại
                        </button>
                    )}
                </div>
            </div>

        </div>
    );
}
