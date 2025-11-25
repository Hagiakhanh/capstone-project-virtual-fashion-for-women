// src/app/admin/product/create/components/VariantItem.tsx
import { X, Upload } from "lucide-react";
import { Size } from "@/models/RequestCreateProduct";
import ImageUploader from "./ImageUploader";
import { VariantError } from "@/utils/productHelpers";

interface VariantItemProps {
    variant: {
        sizeId: number;
        sizeCode: string;
        variantName: string;
        quantity: number;
        productWeight: number;
        productLength: number;
        productWidth: number;
        productHeight: number;
        clothesLength: number;
        imageUrl: File | null;
    };
    variantIndex: number;
    sizes: Size[];
    onUpdate: (field: string, value: any) => void;
    onRemove: () => void;
    onSizeSelect: (sizeId: number) => void;
    //onFileChange: (file: File) => void;
    usedSizeIds: number[];
    errors?: VariantError | null;
}

export default function VariantItem({
    variant,
    variantIndex,
    sizes,
    onUpdate,
    onRemove,
    onSizeSelect,
    usedSizeIds,
    //onFileChange,
    errors,
}: VariantItemProps) {

    const handleNumericChange = (
        field: string,
        value: string,
        max: number,
        defaultOnEmpty: number = 0,
        isInteger: boolean = false
    ) => {
        if (value === "") {
            onUpdate(field, defaultOnEmpty);
            return;
        }

        const num = isInteger ? parseInt(value) : parseFloat(value);

        if (isNaN(num)) {
            return;
        }

        if (num <= max) {
            onUpdate(field, num);
        }
    };

    return (
        <div className="border border-gray-200 rounded-md p-3 mb-3 bg-white">
            <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-600">
                    Size {variantIndex + 1}
                </span>
                <button
                    type="button"
                    onClick={onRemove}
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                    <X size={18} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Tên biến thể *
                    </label>
                    <input
                        type="text"
                        value={variant.variantName}
                        onChange={(e) => onUpdate("variantName", e.target.value)}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors?.variantName ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors?.variantName && (
                        <p className="text-red-500 text-xs mt-1">{errors.variantName}</p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Chọn size *
                    </label>
                    <select
                        value={variant.sizeId}
                        onChange={(e) => onSizeSelect(parseInt(e.target.value))}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors?.sizeId ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        <option value={0}>-- Chọn size --</option>
                        {sizes.map((s) => {
                            // <-- LOGIC VÔ HIỆU HÓA ĐƯỢC THÊM TẠI ĐÂY
                            const isUsedByAnother = 
                                usedSizeIds.includes(s.sizeId) && s.sizeId !== variant.sizeId;

                            return (
                                <option 
                                    key={s.sizeId} 
                                    value={s.sizeId}
                                    disabled={isUsedByAnother}
                                    className={isUsedByAnother ? "text-gray-300 bg-gray-200" : ""}
                                >
                                    {s.sizeCode}
                                </option>
                            );
                        })}
                    </select>
                    {errors?.sizeId && (
                        <p className="text-red-500 text-xs mt-1">{errors.sizeId}</p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Số lượng *
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="9999"
                        value={variant.quantity}
                        onChange={(e) =>
                            handleNumericChange("quantity", e.target.value, 9999,  0, true)
                        }
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors?.quantity ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors?.quantity && (
                        <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Cân nặng (kg)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        max="10"
                        value={variant.productWeight}
                        onChange={(e) =>
                            handleNumericChange("productWeight", e.target.value, 10, 0.1)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Chiều dài (cm)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        max="100"
                        value={variant.productLength}
                        onChange={(e) =>
                            handleNumericChange("productLength", e.target.value, 100, 1)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Dài áo/quần/váy/đầm (cm)
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="500"
                        value={variant.clothesLength}
                        onChange={(e) =>
                            handleNumericChange("clothesLength", e.target.value, 500, 1)
                        }
                        // Thêm logic hiển thị lỗi nếu cần
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors?.clothesLength ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors?.clothesLength && (
                        <p className="text-red-500 text-xs mt-1">{errors.clothesLength}</p>
                    )}
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Chiều rộng (cm)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        max="100"
                        value={variant.productWidth}
                        onChange={(e) =>
                            handleNumericChange("productWidth", e.target.value, 100, 1)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Chiều cao (cm)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        max="100"
                        value={variant.productHeight}
                        onChange={(e) =>
                            handleNumericChange("productHeight", e.target.value, 100, 1)
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Cập nhật "Ảnh variant *" */}
                <div className="col-span-2">
                <ImageUploader
                    label="Ảnh variant *"
                    selectedFile={variant.imageUrl}
                    onFileChange={(file) => onUpdate("imageUrl", file)}
                    error={errors?.imageUrl}
                />
                </div>
            </div>
        </div>
    );
}