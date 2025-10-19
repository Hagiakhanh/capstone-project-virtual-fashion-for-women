"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface ColorModalProps {
    isOpen: boolean;
    onClose: () => void;

    // Mode: "create" (dùng trong create product) | "update" (dùng trong update product)
    mode: "create" | "update";

    // Dữ liệu màu (chỉ dùng khi create hoặc khi update có initial data)
    colorData?: { colorName?: string; colorPrefix?: string; hexCode?: string };

    // Callback cho 2 chế độ
    onSave?: (colorData: { colorName: string; colorPrefix: string; hexCode: string }) => void;
    onUpdate?: (field: string, value: any) => void;
}

export default function ColorModal({
    isOpen,
    onClose,
    mode,
    colorData,
    onSave,
    onUpdate,
}: ColorModalProps) {
    // Local state chỉ dùng khi ở chế độ update (uncontrolled)
    const [localData, setLocalData] = useState({
        colorName: "",
        colorPrefix: "",
        hexCode: "#",
    });

    useEffect(() => {
        if (isOpen && mode === "update") {
            setLocalData({
                colorName: colorData?.colorName || "",
                colorPrefix: colorData?.colorPrefix || "",
                hexCode: colorData?.hexCode || "#",
            });
        }
    }, [isOpen, colorData, mode]);

    const handleHexChange = (value: string) => {
        let formatted = value.startsWith("#") ? value : `#${value}`;
        if (formatted.length > 7) formatted = formatted.slice(0, 7);
        const regex = /^#([A-Fa-f0-9]{0,6})$/;

        if (regex.test(formatted)) {
            if (mode === "create" && onUpdate) {
                onUpdate("hexCode", formatted.toUpperCase());
            } else {
                setLocalData({ ...localData, hexCode: formatted.toUpperCase() });
            }
        }
    };

    const handleSave = () => {
        const data = mode === "update" ? localData : colorData!;
        if (data.colorName && data.colorPrefix && data.hexCode?.length === 7) {
            if (mode === "update" && onSave) onSave(data as { colorName: string; colorPrefix: string; hexCode: string });
            onClose();
        } else {
            alert("Vui lòng điền đầy đủ thông tin màu.");
        }
    };

    if (!isOpen) return null;

    const current = mode === "create" ? colorData! : localData;

    return (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-xs z-40 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md relative z-50">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold mb-4">
                    {mode === "update" ? "Cập nhật màu" : "Tạo màu mới"}
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                    Thông tin màu này sẽ được lưu cùng với sản phẩm.
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên màu *</label>
                        <input
                            type="text"
                            value={current.colorName}
                            onChange={(e) =>
                                mode === "create"
                                    ? onUpdate?.("colorName", e.target.value)
                                    : setLocalData({ ...localData, colorName: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã màu (Prefix) *</label>
                        <input
                            type="text"
                            value={current.colorPrefix}
                            onChange={(e) =>
                                mode === "create"
                                    ? onUpdate?.("colorPrefix", e.target.value.toUpperCase())
                                    : setLocalData({ ...localData, colorPrefix: e.target.value.toUpperCase() })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hex Code *</label>
                        <div className="flex gap-2">
                            <input
                                type="color"
                                value={current.hexCode}
                                onChange={(e) =>
                                    mode === "create"
                                        ? onUpdate?.("hexCode", e.target.value)
                                        : setLocalData({ ...localData, hexCode: e.target.value })
                                }
                                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={current.hexCode}
                                onChange={(e) => handleHexChange(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={mode === "update" ? handleSave : onClose}
                    className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 mt-6 font-semibold"
                >
                    Xong
                </button>
            </div>
        </div>
    );
}
