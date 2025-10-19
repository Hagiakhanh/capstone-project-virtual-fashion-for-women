// src/app/admin/product/create/components/ColorSection.tsx
import { Trash2, Upload, Plus } from "lucide-react";
import { Color, Size, ProductColorRequest } from "@/models/RequestCreateProduct";
import VariantItem from "./VariantItem";
import { useEffect, useState } from "react";
import ImageUploader from "./ImageUploader";
import Image from "next/image";
import NewColorModal from "./NewColorModal";
import ColorModal from "./ColorModal";
import { on } from "events";

interface ColorSectionProps {
    color: ProductColorRequest; // <-- Dùng type cụ thể
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
    onFileChange: (
        file: File,
        type: "noBg" | "variant",
        variantIndex?: number
    ) => void;
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
    const [isColorModalOpen, setIsColorModalOpen] = useState(false);
    const [multiPreviews, setMultiPreviews] = useState<string[]>([]);

    // Cập nhật hàm xử lý chọn màu
    const handleColorSelectChange = (colorId: number) => {
        onColorSelect(colorId); // Gọi hàm gốc từ page.tsx để cập nhật state

        if (colorId === 0) {
            setIsColorModalOpen(true); // Tự động mở modal khi chọn "Tạo màu mới"
        } else {
            setIsColorModalOpen(false); // Đóng modal nếu đang mở
        }
    };

    const handleMultipleImagesSelect = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = Array.from(e.target.files || []);
        onMultipleImages(files);
    };

    // Thêm 2 hàm xử lý kéo thả cho "Nhiều ảnh"
    const handleMultipleImagesDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const files = Array.from(e.dataTransfer.files || []).filter(f => f.type.startsWith("image/"));
        if (files.length > 0) {
            onMultipleImages(files);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // Thêm useEffect để tạo/hủy URLs cho preview nhiều ảnh
    useEffect(() => {
        if (!color.productVariantImages || color.productVariantImages.length === 0) {
            setMultiPreviews([]);
            return;
        }

        const objectUrls = color.productVariantImages
        .map((file) => {
            // Đảm bảo file là một đối tượng File hợp lệ
            if (file && typeof file.name === "string") {
                return URL.createObjectURL(file);
            }
            return null;
        })
        .filter((url) => url !== null) as string[];

        setMultiPreviews(objectUrls);

        // Cleanup: Hủy các object URLs khi component unmount hoặc file thay đổi
        return () => {
            objectUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [color.productVariantImages]); // Chạy lại khi mảng file thay đổi

    return (
        <div className="border rounded-lg p-4 mb-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                    Màu {colorIndex + 1}
                </h3>
                <button
                    type="button"
                    onClick={onRemove}
                    className="text-red-500 hover:text-red-700"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            <div className="space-y-4">
                <div className="flex items-start gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chọn màu *
                        </label>
                        <select
                            value={color.colorId}
                            onChange={(e) => handleColorSelectChange(parseInt(e.target.value))}
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
                        <div className="flex-1 p-3 border border-dashed border-blue-400 rounded-md bg-blue-50">
                            <p className="text-sm text-gray-700 mb-2">
                                Bạn đang tạo một màu mới.
                                {color.colorName && (
                                    <span className="block text-xs font-medium text-blue-700">
                                        Tên: {color.colorName}, Mã: {color.colorPrefix}, Hex: {color.hexCode}
                                    </span>
                                )}
                            </p>
                            <button
                                type="button"
                                onClick={() => setIsColorModalOpen(true)}
                                className="w-full px-4 py-2 bg-white border border-blue-500 text-blue-600 font-medium text-sm rounded-lg hover:bg-blue-100"
                            >
                                Chỉnh sửa thông tin màu mới
                            </button>
                        </div>
                    )}
                </div>

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

                {/* Cập nhật "Ảnh không nền" */}
                <div>
                <ImageUploader
                    label="Ảnh không nền (tùy chọn)"
                    selectedFile={color.noBgImgUrl}
                    onFileChange={(file) => onUpdate("noBgImgUrl", file)}
                />
                </div>

                {/* Cập nhật "Ảnh biến thể (nhiều ảnh)" */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ảnh biến thể (nhiều ảnh)
                    </label>
                    <label
                        htmlFor={`multi-image-upload-${colorIndex}`}
                        onDrop={handleMultipleImagesDrop}
                        onDragOver={handleDragOver}
                        className="relative flex flex-col items-center justify-center w-30 h-30 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                        {/* ... (Icon Upload và text giữ nguyên) ... */}
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                            <Upload size={32} className="text-gray-400 mb-2" />
                            <p className="mb-1 text-sm text-gray-500">
                                <span className="font-semibold">Nhấn để tải lên</span> hoặc
                                kéo thả
                            </p>
                            <p className="text-xs text-gray-500">Tải lên nhiều ảnh</p>
                        </div>
                        <input
                            id={`multi-image-upload-${colorIndex}`}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleMultipleImagesSelect}
                            className="hidden"
                        />
                    </label>

                    {/* SỬA ĐỔI: Hiển thị grid ảnh preview thay vì text list */}
                    {multiPreviews.length > 0 && (
                        <div className="mt-2">
                            <p className="text-sm text-gray-600 mb-2">
                                Đã chọn: {multiPreviews.length} ảnh
                            </p>
                            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                                {multiPreviews.map((src, index) => (
                                    <div
                                        key={index}
                                        className="relative w-full aspect-square rounded-md overflow-hidden border bg-gray-100"
                                    >
                                        <Image
                                            src={src}
                                            alt={`Xem trước ${index + 1}`}
                                            layout="fill"
                                            objectFit="cover"
                                            className="rounded-md"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                {/* KẾT THÚC SỬA ĐỔI */}
                </div>

                <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-gray-700">Biến thể (Size)</h4>
                        <button
                            type="button"
                            onClick={onAddVariant}
                            className="flex items-center gap-2 px-3 py-1 bg-indigo-500 text-white text-sm rounded-lg hover:bg-indigo-600"
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
                            onUpdate={(field, value) =>
                                onUpdateVariant(variantIndex, field, value)
                            }
                            onRemove={() => onRemoveVariant(variantIndex)}
                            onSizeSelect={(sizeId) => onSizeSelect(variantIndex, sizeId)}
                            onFileChange={(file) =>
                                onFileChange(file, "variant", variantIndex)
                            }
                        />
                    ))}
                </div>
            </div>
            {/* Render Modal (chỉ mở khi isColorModalOpen=true VÀ colorId=0) */}
            {/* <NewColorModal
                isOpen={isColorModalOpen && color.colorId === 0}
                onClose={() => setIsColorModalOpen(false)}
                colorData={color}
                onUpdate={onUpdate}
            /> */}
            <ColorModal
                isOpen={isColorModalOpen}
                onClose={() => setIsColorModalOpen(false)}
                mode="create"
                colorData={color}
                onUpdate={onUpdate}
            />

        </div>
    );
}