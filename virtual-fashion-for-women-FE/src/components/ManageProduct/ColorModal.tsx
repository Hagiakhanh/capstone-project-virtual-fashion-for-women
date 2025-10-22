"use client";

import { X } from "lucide-react";

// Định nghĩa lại các props để component này trở nên "ngu ngốc" (Dumb Component)
// Nó chỉ nhận dữ liệu và hàm xử lý từ component cha.
interface ColorModalProps {
    isOpen: boolean;
    onClose: () => void; // Hàm để đóng modal
    mode: "create" | "update";
    colorData?: { colorName?: string; colorPrefix?: string; hexCode?: string };

    // Các hàm callback rõ ràng cho từng hành động
    onNameChange: (value: string) => void;
    onPrefixChange: (value: string) => void;
    onHexChange: (value: string) => void;
    onConfirm: () => void; // Cha sẽ xử lý logic khi nhấn "Xong"

    // Lỗi và trạng thái hợp lệ được truyền từ cha xuống
    nameError?: string;
    prefixError?: string;
    hexError?: string;
    isFormValid: boolean;
}

export default function ColorModal({
    isOpen,
    onClose,
    mode,
    colorData,
    onNameChange,
    onPrefixChange,
    onHexChange,
    onConfirm,
    nameError,
    prefixError,
    hexError,
    isFormValid,
}: ColorModalProps) {
    // Component này không còn state nội bộ cho lỗi hay dữ liệu nữa.

    const handleAttemptClose = () => {
        // Vẫn giữ lại alert để trải nghiệm người dùng tốt hơn
        if (nameError || prefixError || hexError) {
            alert("Tên màu, mã màu hoặc Hex code đang bị trùng. Vui lòng sửa lại trước khi đóng.");
            return;
        }
        onClose();
    };

    // Hàm xử lý cho ô input text của hex code
    const handleHexInputChange = (newValue: string) => {
        // Chỉ format và gọi lên cha, không tính toán lỗi
        let formatted = newValue.startsWith("#") ? newValue : `#${newValue}`;
        if (formatted.length > 7) formatted = formatted.slice(0, 7);
        //onHexChange(formatted);
        // Regex kiểm tra mã hex hợp lệ (#RGB hoặc #RRGGBB)
        const hexRegex = /^#([A-Fa-f0-9]{3}){1,2}$/;

        // Gọi hàm cha kèm theo kiểm tra hợp lệ (nếu muốn)
        if (hexRegex.test(formatted)) {
            onHexChange(formatted.toUpperCase()); // hợp lệ → truyền lên
        } else {
            onHexChange(formatted.toUpperCase()); // vẫn truyền để hiển thị
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={handleAttemptClose}></div>

            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md relative z-50">
                <button
                    type="button"
                    onClick={handleAttemptClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                    <X size={20} />
                </button>

                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                    {mode === "update" ? "Cập nhật màu" : "Tạo màu mới"}
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                    Thông tin màu này sẽ được dùng để tạo biến thể sản phẩm.
                </p>

                <div className="space-y-4">
                    {/* Tên màu */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên màu *</label>
                        <input
                            type="text"
                            value={colorData?.colorName || ""}
                            onChange={(e) => onNameChange(e.target.value)}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                nameError ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
                            }`}
                            placeholder="VD: Xanh Navy"
                        />
                        {nameError && (
                            <p className="text-xs text-red-600 mt-1">{nameError}</p>
                        )}
                    </div>

                    {/* Mã màu (Prefix) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mã màu (Prefix) *</label>
                        <input
                            type="text"
                            value={colorData?.colorPrefix || ""}
                            onChange={(e) => onPrefixChange(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm ${
                                prefixError ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
                            }`}
                            placeholder="VD: NVY (Viết tắt không dấu)"
                        />
                        {prefixError && (
                            <p className="text-xs text-red-600 mt-1">{prefixError}</p>
                        )}
                    </div>

                    {/* Hex Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hex Code *</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={(colorData?.hexCode && colorData.hexCode.length === 7) ? colorData.hexCode : "#FFFFFF"}
                                onChange={(e) => onHexChange(e.target.value)}
                                className="w-10 h-10 p-0 border border-gray-300 rounded-md cursor-pointer shrink-0"
                                title="Chọn màu"
                            />
                            <input
                                type="text"
                                value={colorData?.hexCode || "#"}
                                onChange={(e) => handleHexInputChange(e.target.value)}
                                className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm font-mono ${
                                    hexError ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "border-gray-300"
                                }`}
                                placeholder="#RRGGBB"
                                maxLength={7}
                            />
                        </div>
                        {hexError && (
                            <p className="text-xs text-red-600 mt-1">{hexError}</p>
                        )}
                        {!hexError && colorData?.hexCode && colorData.hexCode.length < 7 && (
                            <p className="text-xs text-orange-600 mt-1">Mã Hex cần đủ 6 ký tự sau dấu #.</p>
                        )}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={!isFormValid}
                    className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-6 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Xong
                </button>
            </div>
        </div>
    );
}
