// src/app/admin/product/create/components/NewColorModal.tsx
"use client";

import { X } from "lucide-react";
import { ProductColorRequest } from "@/models/RequestCreateProduct";

interface NewColorModalProps {
    isOpen: boolean;
    onClose: () => void;
    colorData: ProductColorRequest; // Nhận toàn bộ object color
    onUpdate: (field: string, value: any) => void; // Nhận hàm update từ cha
}

export default function NewColorModal({
    isOpen,
    onClose,
    colorData,
    onUpdate,
}: NewColorModalProps) {
    if (!isOpen) return null;

    // Logic xử lý Hex Code (chuyển từ ColorSection sang đây)
    const handleHexChange = (value: string) => {
        let formatted = value.startsWith("#") ? value : `#${value}`;
        if (formatted.length > 7) formatted = formatted.slice(0, 7);

        const regex = /^#([A-Fa-f0-9]{0,6})$/;
        if (regex.test(formatted)) {
            onUpdate("hexCode", formatted.toUpperCase());
        }
    };

    return (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-xs z-40 flex items-center justify-center p-4">
            {/* Nền mờ, nhấn vào sẽ đóng modal */}
            <div className="absolute inset-0" onClick={onClose}></div>

            {/* Nội dung Modal */}
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md relative z-50">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-6">Tạo Màu Mới</h2>
                <p className="text-sm text-gray-500 mb-4">
                    Thông tin màu này sẽ được lưu cùng với sản phẩm.
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên màu *
                        </label>
                        <input
                            type="text"
                            value={colorData.colorName}
                            onChange={(e) => onUpdate("colorName", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mã màu (Prefix) *
                        </label>
                        <input
                            type="text"
                            value={colorData.colorPrefix}
                            onChange={(e) => onUpdate("colorPrefix", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hex Code *
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={colorData.hexCode}
                                onChange={(e) => onUpdate("hexCode", e.target.value)}
                                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={colorData.hexCode}
                                onChange={(e) => handleHexChange(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose} // Nút này chỉ cần đóng Modal, vì data đã được update
                        className="w-full px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Xong
                    </button>
                </div>
            </div>
        </div>
    );
}