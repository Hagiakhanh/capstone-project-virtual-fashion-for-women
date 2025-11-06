// src/app/admin/product/create/components/ColorSection.tsx
import { Trash2, Upload, Plus } from "lucide-react";
import { Color, Size, ProductColorRequest } from "@/models/RequestCreateProduct";
import { ProductColorError } from "@/utils/productHelpers";
import VariantItem from "./VariantItem";
import { useCallback, useEffect, useState } from "react";
import ImageUploader from "./ImageUploader";
import Image from "next/image";
//import NewColorModal from "./NewColorModal";
import ColorModal from "./ColorModal";
import { on } from "events";
import { messageToast } from "@/helpers/toastHelper";

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
    usedColorIds: number[]; // <-- THÊM PROP MỚI
    usedNewNames: string[];
    usedNewPrefixes: string[];
    usedNewHexCodes: string[];

    existingNames: string[];
    existingPrefixes: string[];
    existingHexCodes: string[];
    errors?: ProductColorError | null;
}

// HÀM HELPER: Xóa 1 phần tử đầu tiên khỏi mảng
const removeFirst = (arr: string[], item: string): string[] => {
    if (!item) return arr; // Nếu item rỗng, trả về mảng gốc
    const index = arr.indexOf(item);
    if (index > -1) {
        // Tạo mảng mới không chứa phần tử tại vị trí 'index'
        return [...arr.slice(0, index), ...arr.slice(index + 1)];
    }
    return arr; // Không tìm thấy, trả về mảng gốc
};

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
    usedColorIds,
    usedNewNames,
    usedNewPrefixes,
    usedNewHexCodes,
    existingNames,
    existingPrefixes,
    existingHexCodes,
    errors,
    }: ColorSectionProps) {
    const [isColorModalOpen, setIsColorModalOpen] = useState(false);
    const [multiPreviews, setMultiPreviews] = useState<string[]>([]);

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

    // <-- THAY ĐỔI 1: Tính toán các sizeId đã được sử dụng BÊN TRONG MÀU NÀY
    const usedSizeIds = color.variants
        .map(v => v.sizeId)
        .filter(id => id !== 0); // Lọc bỏ giá trị 0 (chưa chọn)

    // 1. Lọc ra danh sách "các màu mới khác"
    const currentPrefixLower = (color.colorPrefix || "").toLowerCase();
    const currentHexLower = (color.hexCode || "").toLowerCase();
    const otherNewNames = removeFirst(usedNewNames, (color.colorName || "").toLowerCase());
    const otherNewPrefixes = removeFirst(usedNewPrefixes, currentPrefixLower);
    const otherNewHexCodes = removeFirst(usedNewHexCodes, currentHexLower);

    // 2. Tạo các hàm validation ổn định
    const getNameError = useCallback((name: string): string => {
        const nameLower = (name || "").toLowerCase();
        if (!nameLower) return "";
        if (otherNewNames.includes(nameLower)) return "Tên màu này đã được dùng cho một màu mới khác.";
        if (existingNames.includes(nameLower)) return "Tên màu này đã tồn tại trong hệ thống.";
        return "";
    }, [otherNewNames, existingNames]);

    const getPrefixError = useCallback((prefix: string): string => {
        const prefixLower = (prefix || "").toLowerCase();
        if (!prefixLower) return "";
        if (otherNewPrefixes.includes(prefixLower)) return "Mã prefix này đã được dùng cho một màu mới khác.";
        if (existingPrefixes.includes(prefixLower)) return "Mã prefix này đã tồn tại trong hệ thống.";
        return "";
    }, [otherNewPrefixes, existingPrefixes]);

    const getHexError = useCallback((hex: string): string => {
        const hexLower = (hex || "").toLowerCase();
        if (!hexLower || hexLower.length < 7) return "";
        if (otherNewHexCodes.includes(hexLower)) return "Mã hex này đã được dùng cho một màu mới khác.";
        if (existingHexCodes.includes(hexLower)) return "Mã hex này đã tồn tại trong hệ thống.";
        return "";
    }, [otherNewHexCodes, existingHexCodes]);

    // 3. Tính toán trạng thái lỗi và hợp lệ của modal
    const nameError = getNameError(color.colorName || "");
    const prefixError = getPrefixError(color.colorPrefix || "");
    const hexError = getHexError(color.hexCode || "");
    const isModalFormValid =
        !!color.colorName &&
        !!color.colorPrefix &&
        color.hexCode?.length === 7 &&
        !nameError &&
        !prefixError &&
        !hexError;

    // 4. Tạo các hàm handler để truyền xuống modal
    const handleModalNameChange = (value: string) => onUpdate("colorName", value);
    const handleModalPrefixChange = (value: string) => onUpdate("colorPrefix", value.toUpperCase());
    const handleModalHexChange = (value: string) => onUpdate("hexCode", value.toUpperCase());

    const handleModalConfirm = () => {
        if (!isModalFormValid) {
            //alert("Vui lòng điền đầy đủ thông tin và sửa các lỗi (nếu có).");
            messageToast.error("Vui lòng điền đầy đủ thông tin và sửa các lỗi (nếu có).");
            return;
        }
        setIsColorModalOpen(false);
    };
    
    const handleColorSelectChange = (colorId: number) => {
        onColorSelect(colorId);
        if (colorId === 0) {
            setIsColorModalOpen(true);
        } else {
            setIsColorModalOpen(false);
        }
    };

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
                            //className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                errors?.colorId ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value={0}>-- Tạo màu mới --</option>
                            {colors.map((c) => {
                                // <-- LOGIC VÔ HIỆU HÓA ĐƯỢC THÊM TẠI ĐÂY
                                const isUsedByAnother = 
                                    usedColorIds.includes(c.colorId) && c.colorId !== color.colorId;
                                
                                return (
                                    <option 
                                        key={c.colorId} 
                                        value={c.colorId}
                                        disabled={isUsedByAnother}
                                        className={isUsedByAnother ? "text-gray-300 bg-gray-200" : ""}
                                    >
                                        {c.colorName} ({c.colorPrefix})
                                    </option>
                                );
                            })}
                        </select>
                        {errors?.colorId && (
                            <p className="text-red-500 text-xs mt-1">{errors.colorId}</p>
                        )}
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

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        PackageLens (tùy chọn)
                    </label>
                    <input
                        type="text"
                        value={color.packageLens}
                        onChange={(e) => onUpdate("packageLens", e.target.value)}
                        placeholder="Nhập PackageLens nếu có"
                        //className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                            errors?.packageLens ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {/* Thêm gợi ý validation tại UI */}
                    {/* {color.lensId && !color.packageLens && (
                        <p className="text-xs text-red-500 mt-1">
                            Bạn phải nhập PackageLens vì đã nhập LensID.
                        </p>
                    )} */}
                    {(errors?.packageLens || (color.lensId && !color.packageLens)) && (
                        <p className="text-xs text-red-500 mt-1">
                            {errors?.packageLens || "Bạn phải nhập PackageLens vì đã nhập LensID."}
                        </p>
                    )}
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
                        //className="relative flex flex-col items-center justify-center w-30 h-30 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                        className={`relative flex flex-col items-center justify-center w-30 h-30 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors ${
                            errors?.productVariantImages ? 'border-red-500' : 'border-gray-300'
                        }`}
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
                    {errors?.productVariantImages && (
                        <p className="text-red-500 text-xs mt-1">{errors.productVariantImages}</p>
                    )}
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
                            usedSizeIds={usedSizeIds}
                            errors={
                                errors?.variants 
                                ? errors.variants[variantIndex] 
                                : null
                            }
                        />
                    ))}
                </div>
            </div>
            {/* Render Modal (chỉ mở khi isColorModalOpen=true VÀ colorId=0) */}
            <ColorModal
                isOpen={isColorModalOpen}
                onClose={() => setIsColorModalOpen(false)}
                mode="create"
                colorData={color}
                onNameChange={handleModalNameChange}
                onPrefixChange={handleModalPrefixChange}
                onHexChange={handleModalHexChange}
                onConfirm={handleModalConfirm}
                // Truyền lỗi và trạng thái hợp lệ
                nameError={nameError}
                prefixError={prefixError}
                hexError={hexError}
                isFormValid={isModalFormValid}
            />

        </div>
    );
}