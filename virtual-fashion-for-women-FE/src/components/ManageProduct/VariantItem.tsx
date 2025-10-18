// src/app/admin/product/create/components/VariantItem.tsx
import { X, Upload } from "lucide-react";
import { Size } from "@/models/RequestCreateProduct";
import ImageUploader from "./ImageUploader";

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
        imageUrl: File | null;
    };
    variantIndex: number;
    sizes: Size[];
    onUpdate: (field: string, value: any) => void;
    onRemove: () => void;
    onSizeSelect: (sizeId: number) => void;
    onFileChange: (file: File) => void;
}

export default function VariantItem({
    variant,
    variantIndex,
    sizes,
    onUpdate,
    onRemove,
    onSizeSelect,
    //onFileChange,
}: VariantItemProps) {
    // const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];
    //     if (file) onFileChange(file);
    // };

    return (
        <div className="border border-gray-200 rounded-md p-3 mb-3 bg-white">
            <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-gray-600">
                    Size {variantIndex + 1}
                </span>
                <button
                    type="button"
                    onClick={onRemove}
                    className="text-red-500 hover:text-red-700"
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Chọn size *
                    </label>
                    <select
                        value={variant.sizeId}
                        onChange={(e) => onSizeSelect(parseInt(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={0}>-- Chọn size --</option>
                        {sizes.map((s) => (
                        <option key={s.sizeId} value={s.sizeId}>
                            {s.sizeCode}
                        </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Số lượng *
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={variant.quantity}
                        onChange={(e) => onUpdate("quantity", parseInt(e.target.value))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Cân nặng (kg)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={variant.productWeight}
                        onChange={(e) =>
                        onUpdate("productWeight", parseFloat(e.target.value))
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
                        step="0.1"
                        value={variant.productLength}
                        onChange={(e) =>
                        onUpdate("productLength", parseFloat(e.target.value))
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Chiều rộng (cm)
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        value={variant.productWidth}
                        onChange={(e) =>
                        onUpdate("productWidth", parseFloat(e.target.value))
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
                        step="0.1"
                        value={variant.productHeight}
                        onChange={(e) =>
                        onUpdate("productHeight", parseFloat(e.target.value))
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
                />
                </div>
            </div>
        </div>
    );
}