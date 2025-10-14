import { Trash2, Upload, Plus } from "lucide-react";
import { Color, Size } from "@/models/RequestCreateProduct";
import VariantItem from "./VariantItem";

interface ColorSectionProps {
    color: {
        colorId: number;
        colorName: string;
        colorPrefix: string;
        hexCode: string;
        lensId: string;
        noBgImgUrl: File | null;
        productVariantImages: File[];
        variants: any[];
    };
    colorIndex: number;
    colors: Color[];
    sizes: Size[];
    onUpdate: (field: string, value: any) => void;
    onRemove: () => void;
    onColorSelect: (colorId: number) => void;
    onAddVariant: () => void;
    onRemoveVariant: (variantIndex: number) => void;
    onUpdateVariant: (variantIndex: number, field: string, value: any) => void;
    onSizeSelect: (variantIndex: number, sizeId: number) => void;
    onFileChange: (file: File, type: "noBg" | "variant", variantIndex?: number) => void;
    onMultipleImages: (files: File[]) => void;
}

export default function ColorSection({
    color,
    colorIndex,
    colors,
    sizes,
    onUpdate,
    onRemove,
    onColorSelect,
    onAddVariant,
    onRemoveVariant,
    onUpdateVariant,
    onSizeSelect,
    onFileChange,
    onMultipleImages,
}: ColorSectionProps) {
    const handleNoBgFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onFileChange(file, "noBg");
    };

    const handleMultipleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        onMultipleImages(files);
    };

    return (
        <div className="border rounded-lg p-4 mb-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Màu {colorIndex + 1}</h3>
                <button
                    type="button"
                    onClick={onRemove}
                    className="text-red-500 hover:text-red-700"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Chọn màu *
                    </label>
                    <select
                        value={color.colorId}
                        onChange={(e) => onColorSelect(parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={0}>-- Tạo màu mới --</option>
                        {colors.map((c) => (
                            <option key={c.colorId} value={c.colorId}>
                                {c.colorName} ({c.colorPrefix})
                            </option>
                        ))}
                    </select>
                </div>

                {color.colorId === 0 && (
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên màu *
                            </label>
                            <input
                                type="text"
                                value={color.colorName}
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
                                value={color.colorPrefix}
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
                                    value={color.hexCode}
                                    onChange={(e) => onUpdate("hexCode", e.target.value)}
                                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={color.hexCode}
                                    onChange={(e) => onUpdate("hexCode", e.target.value)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lens ID (tùy chọn)
                    </label>
                    <input
                        type="text"
                        value={color.lensId}
                        onChange={(e) => onUpdate("lensId", e.target.value)}
                        placeholder="Nhập Lens ID nếu có"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ảnh không nền (tùy chọn)
                    </label>
                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 w-fit">
                        <Upload size={20} />
                        Chọn ảnh
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleNoBgFileSelect}
                            className="hidden"
                        />
                    </label>
                    {color.noBgImgUrl && (
                        <span className="text-sm text-gray-600 mt-2 block">
                            {color.noBgImgUrl.name}
                        </span>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ảnh biến thể (nhiều ảnh)
                    </label>
                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 w-fit">
                        <Upload size={20} />
                        Chọn nhiều ảnh
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleMultipleImagesSelect}
                            className="hidden"
                        />
                    </label>
                    {color.productVariantImages.length > 0 && (
                        <div className="text-sm text-gray-600 mt-2">
                            {color.productVariantImages.length} ảnh đã chọn
                        </div>
                    )}
                </div>

                <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-700">Biến thể (Size)</h4>
                        <button
                            type="button"
                            onClick={onAddVariant}
                            className="flex items-center gap-2 px-3 py-1 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600"
                        >
                            <Plus size={16} />
                            Thêm size
                        </button>
                    </div>

                    {color.variants.map((variant, variantIndex) => (
                        <VariantItem
                            key={variantIndex}
                            variant={variant}
                            variantIndex={variantIndex}
                            sizes={sizes}
                            onUpdate={(field, value) => onUpdateVariant(variantIndex, field, value)}
                            onRemove={() => onRemoveVariant(variantIndex)}
                            onSizeSelect={(sizeId) => onSizeSelect(variantIndex, sizeId)}
                            onFileChange={(file) => onFileChange(file, "variant", variantIndex)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}