// src/app/admin/product/update/[productId]/components/UpdateColorItem.tsx
import { useState, useEffect } from 'react'; // Thêm useState
import { Trash2, Upload, Plus } from 'lucide-react';
import { Color, Size, UpdateProductColorFormData } from '@/models/RequestUpdateProduct';
import UpdateVariantItem from './UpdateVariantItem';
//import CreateColorModal from './CreateColorModal'; // Import modal mới
import ColorModal from './ColorModal';

interface UpdateColorItemProps {
    productColor: UpdateProductColorFormData;
    colorIndex: number;
    colors: Color[];
    sizes: Size[];
    onUpdate: (field: string, value: any) => void;
    onRemove: () => void;
    onAddVariant: () => void;
    onRemoveVariant: (variantIndex: number) => void;
    onUpdateVariant: (variantIndex: number, field: string, value: any) => void;
}

export default function UpdateColorItem({
    productColor,
    colorIndex,
    colors,
    sizes,
    onUpdate,
    onRemove,
    onAddVariant,
    onRemoveVariant,
    onUpdateVariant,
}: UpdateColorItemProps) {
    // State để quản lý modal
    const [isColorModalOpen, setIsColorModalOpen] = useState(false);

    // Tự động mở modal khi một item màu mới được thêm vào
    useEffect(() => {
         if (productColor.colorId === undefined && !productColor.colorName) {
            setIsColorModalOpen(true);
         }
    }, []); // Mảng rỗng đảm bảo useEffect chỉ chạy một lần khi component được render lần đầu.

    const handleNoBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpdate('noBgImgUrl', file);
            onUpdate('noBgImgPreview', URL.createObjectURL(file));
        }
    };

    const handleVariantImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            onUpdate('productVariantImages', files);
            onUpdate('productVariantImagePreviews', files.map(f => URL.createObjectURL(f)));
        }
    };

    // Xử lý khi chọn màu từ dropdown
    const handleColorSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === "") {
            // Nếu chọn "-- Tạo màu mới --", mở modal
            setIsColorModalOpen(true);
        } else {
            // Nếu chọn màu có sẵn
            onUpdate('colorId', parseInt(value));
            // Xóa thông tin màu mới (nếu có)
            onUpdate('colorName', '');
            onUpdate('colorPrefix', '');
            onUpdate('hexCode', '');
        }
    };

    // Xử lý khi lưu từ modal
    const handleSaveNewColor = (colorData: { colorName: string; colorPrefix: string; hexCode: string }) => {
        onUpdate('colorId', undefined); // Đảm bảo colorId là undefined
        onUpdate('colorName', colorData.colorName);
        onUpdate('colorPrefix', colorData.colorPrefix);
        onUpdate('hexCode', colorData.hexCode);
        setIsColorModalOpen(false);
    };

    // Lấy thông tin màu ban đầu cho modal (để chỉnh sửa)
    const getInitialColorData = () => {
        if (!productColor.colorId && productColor.colorName) {
            return {
                colorName: productColor.colorName,
                colorPrefix: productColor.colorPrefix,
                hexCode: productColor.hexCode,
            };
        }
        return undefined;
    };

    return (
        <div className="border p-4 mb-4 rounded-lg bg-gray-50"> {/* Thêm bg-gray-50 */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Màu {colorIndex + 1}</h3> {/* Tăng font-size */}
                <button
                type="button"
                    onClick={onRemove}
                    className="text-red-600 hover:text-red-800"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            <div className="space-y-4">
                {/* Color selection */}
                <div className="flex items-start gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                             Chọn màu *
                        </label>
                        <select
                             value={productColor.colorId || ''}
                             onChange={handleColorSelectChange}
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">-- Tạo màu mới --</option>
                            {colors.map((c) => (
                                <option key={c.colorId} value={c.colorId}>
                                    {c.colorName} ({c.colorPrefix})
                                 </option>
                            ))}
                        </select>
                    </div>

                    {/* ===== SỬA LỖI: Xóa bỏ mt-7 (margin-top) ===== */}
                    {!productColor.colorId && (
                        <div className="flex-1 p-3 border border-dashed border-blue-400 rounded-md bg-blue-50">
                            <p className="text-sm text-gray-700 mb-2">
                                {productColor.colorName
                                    ? "Thông tin màu mới:"
                                    : "Bạn đang tạo một màu mới."
                                }
                                {productColor.colorName && (
                                <span className="block text-xs font-medium text-blue-700 mt-1">
                                    Tên: {productColor.colorName}, Mã: {productColor.colorPrefix}
                                 </span>
                                )}
                            </p>
                            <button
                                type="button"
                                onClick={() => setIsColorModalOpen(true)}
                                className="w-full px-4 py-2 bg-white border border-blue-500 text-blue-600 font-medium text-sm rounded-lg hover:bg-blue-100"
                            >
                                {productColor.colorName ? 'Chỉnh sửa' : 'Thêm thông tin'} màu mới
                            </button>
                        </div>
                    )}
                </div>

                {/* XÓA BỎ CÁC TRƯỜNG TẠO MÀU MỚI INLINE Ở ĐÂY */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lens ID (tùy chọn)</label>
                    <input
                        type="text"
                        value={productColor.lensId || ''}
                        onChange={(e) => onUpdate('lensId', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white"
                    />
                </div>

                {/* ... (Phần ảnh không nền và ảnh variants giữ nguyên) ... */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh không nền (tùy chọn)</label>
                    {productColor.noBgImgPreview && (
                        <img 
                            src={productColor.noBgImgPreview} 
                            alt="Preview" 
                            className="w-32 h-32 object-cover mb-2 rounded border bg-white" 
                        />
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg cursor-pointer hover:bg-gray-100 border border-blue-500 w-fit">
                        <Upload size={18} />
                        {productColor.noBgImgPreview ? 'Đổi ảnh' : 'Chọn ảnh'}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleNoBgImageChange}
                            className="hidden"
                        />
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh biến thể (nhiều ảnh)</label>
                    {productColor.productVariantImagePreviews && productColor.productVariantImagePreviews.length > 0 && (
                        <div className="flex gap-2 mb-2 flex-wrap p-2 rounded-lg bg-white">
                            {productColor.productVariantImagePreviews.map((url: string, idx: number) => (
                                <img 
                                    key={idx} 
                                    src={url} 
                                    alt={`Preview ${idx}`} 
                                    className="w-20 h-20 object-cover rounded border" 
                                />
                            ))}
                        </div>
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg cursor-pointer hover:bg-gray-100 border border-blue-500 w-fit">
                        <Upload size={18} />
                            Chọn nhiều ảnh
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleVariantImagesChange}
                            className="hidden"
                        />
                    </label>
                </div>

                {/* Variants */}
                <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-lg font-semibold text-gray-800">Biến thể (Size)</h4>
                        <button
                            type="button"
                            onClick={onAddVariant}
                            className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 text-sm"
                        >
                            <Plus size={16} />
                            Thêm size
                        </button>
                    </div>

                    {productColor.variants?.map((variant, variantIndex) => (
                        <UpdateVariantItem
                            key={variant.productVariantId || variantIndex} // Ưu tiên dùng ID
                            variant={variant}
                            variantIndex={variantIndex}
                            sizes={sizes}
                            onUpdate={(field, value) => onUpdateVariant(variantIndex, field, value)}
                            onRemove={() => onRemoveVariant(variantIndex)}
                        />
                    ))}
                </div>
            </div>

            {/* Render Modal */}
            {/* <CreateColorModal
                isOpen={isColorModalOpen}
                onClose={() => setIsColorModalOpen(false)}
                onSave={handleSaveNewColor}
                initialData={getInitialColorData()}
            /> */}
            <ColorModal
                isOpen={isColorModalOpen}
                onClose={() => setIsColorModalOpen(false)}
                mode="update"
                colorData={getInitialColorData()}
                onSave={handleSaveNewColor}
            />

        </div>
    );
}