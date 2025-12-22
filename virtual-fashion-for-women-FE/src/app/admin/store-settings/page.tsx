'use client';

import { useEffect, useState } from 'react';
import { Edit2, Save, X, Truck } from 'lucide-react';
import { ShippingRegionFee } from '@/models/ShippingRegionFee';
import { api } from '@/api/instance';
import { messageToast } from '@/helpers/toastHelper';
import LoadingSpinner from '@/components/Loading/LoadingSpinner';

export default function ShopConfigAdmin() {
    const [shippingData, setShippingData] = useState<ShippingRegionFee[]>([]);
    const [isEditingShipping, setIsEditingShipping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleEditShipping = () => {
        setIsEditingShipping(true);
    };

    const handleSaveShipping = async () => {
        setIsLoading(true);
        try {
            const response = await api.put('/shipping/fees', shippingData);
            if (response.status === 200) {
                messageToast.success("Cập nhật giá vận chuyển thành công");
                setIsEditingShipping(false);
            }
        } catch (error: any) {
            console.error("Save shipping fee error:", error);
            messageToast.error("Lỗi khi lưu giá vận chuyển");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelShipping = () => {
        setIsEditingShipping(false);
        fetchShippingFeeData();
    };

    const handleShippingChange = (id: number, field: 'basePrice' | 'additionalWeightFee', value: number) => {
        const updatedShipping = shippingData.map(s =>
            s.shippingRegionId === id ? { ...s, [field]: value } : s
        );
        setShippingData(updatedShipping);
    };

    const fetchShippingFeeData = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/shipping/fees');
            if (response.status === 200) {
                console.log("Fetched shipping fee data:", response.data);
                setShippingData(response.data);
            }
        } catch (error: any) {
            console.error("Fetch shipping fee error:", error);
            messageToast.error("Lỗi khi tải bảng giá vận chuyển");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchShippingFeeData();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
            <div className="">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Cấu Hình Cửa Hàng</h1>
                    <p className="text-gray-600">Quản lý thông tin cửa hàng và giá vận chuyển</p>
                </div>

                {/* Shipping Configuration */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                    <div className="border-b border-gray-100 px-6 py-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                <Truck className="text-indigo-600" size={28} />
                                Cấu Hình Vận Chuyển
                            </h2>
                            {!isEditingShipping && (
                                <button
                                    onClick={handleEditShipping}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 text-gray-700 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    <Edit2 size={18} />
                                    Chỉnh Sửa
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-6">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-12">
                                <LoadingSpinner />
                            </div>
                        ) : !isEditingShipping ? (
                            // View Mode - Table
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                Tuyến
                                            </th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                Khối Lượng
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                                Phí Cơ Bảng
                                            </th>
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                                Thêm 0.5 kg
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {shippingData.map((shipping, index) => (
                                            <tr
                                                key={shipping.shippingRegionId}
                                                className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                            >
                                                <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                                                    {shipping.regionType}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-800">
                                                    0 - 0.5 kg
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                                    {shipping.basePrice.toLocaleString('vi-VN')} ₫
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                                                    {shipping.additionalWeightFee.toLocaleString('vi-VN')} ₫
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto mb-4">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100 border-b-2 border-gray-300">
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                    Tuyến
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                    Khối Lượng
                                                </th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                                    Phí Cơ Bản
                                                </th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                                    Thêm 0.5 kg
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {shippingData.map((shipping, index) => (
                                                <tr
                                                    key={shipping.shippingRegionId}
                                                    className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                                                >
                                                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                                                        {shipping.regionType}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-800">
                                                        0 - 2 kg
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            value={shipping.basePrice ? shipping.basePrice.toLocaleString("vi-VN") : ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value.replace(/[^0-9]/g, '');
                                                                handleShippingChange(shipping.shippingRegionId, 'basePrice', value ? parseInt(value) : 0);
                                                            }}
                                                            className="w-full max-w-[140px] ml-auto bg-white text-right text-sm font-semibold text-gray-900 px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            value={shipping.additionalWeightFee ? shipping.additionalWeightFee.toLocaleString("vi-VN") : ""}
                                                            onChange={(e) => {
                                                                const value = e.target.value.replace(/[^0-9]/g, '');
                                                                handleShippingChange(shipping.shippingRegionId, 'additionalWeightFee', value ? parseInt(value) : 0);
                                                            }}
                                                            className="w-full max-w-[140px] ml-auto bg-white text-right text-sm font-semibold text-gray-900 px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleSaveShipping}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        <Save size={18} />
                                        Lưu Thay Đổi
                                    </button>
                                    <button
                                        onClick={handleCancelShipping}
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        <X size={18} />
                                        Hủy
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}