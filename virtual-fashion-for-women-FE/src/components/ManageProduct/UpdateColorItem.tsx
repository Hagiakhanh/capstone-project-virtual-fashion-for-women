// src/app/admin/product/update/[productId]/components/UpdateColorItem.tsx
import { Trash2, Upload, Plus } from 'lucide-react';
import { Color, Size, UpdateProductColorFormData } from '@/models/RequestUpdateProduct';
import UpdateVariantItem from './UpdateVariantItem';

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

    return (
        <div className="border p-4 mb-4 rounded">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Màu {colorIndex + 1}</h3>
            <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
            <Trash2 size={16} />
            Xóa
            </button>
        </div>

        <div className="space-y-4">
            {/* Color selection */}
            <div>
            <label className="block font-medium mb-2">Chọn màu có sẵn</label>
            <select
                value={productColor.colorId || ''}
                onChange={(e) => onUpdate('colorId', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full border rounded px-3 py-2"
            >
                <option value="">-- Hoặc tạo màu mới --</option>
                {colors.map(color => (
                <option key={color.colorId} value={color.colorId}>
                    {color.colorName} ({color.colorPrefix})
                </option>
                ))}
            </select>
            </div>

            {/* Create new color fields */}
            {(!productColor.colorId || productColor.colorId === 0) && (
            <div className="bg-gray-50 p-4 rounded">
                <p className="font-medium mb-2">Tạo màu mới:</p>
                <div className="space-y-2">
                <input
                    type="text"
                    placeholder="Color Prefix (VD: BLK)"
                    value={productColor.colorPrefix || ''}
                    onChange={(e) => onUpdate('colorPrefix', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    type="text"
                    placeholder="Tên màu (VD: Đen)"
                    value={productColor.colorName || ''}
                    onChange={(e) => onUpdate('colorName', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                />
                <input
                    type="text"
                    placeholder="Hex Code (VD: #000000)"
                    value={productColor.hexCode || ''}
                    onChange={(e) => onUpdate('hexCode', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                />
                </div>
            </div>
            )}

            <div>
            <label className="block font-medium mb-2">Lens ID</label>
            <input
                type="text"
                value={productColor.lensId || ''}
                onChange={(e) => onUpdate('lensId', e.target.value)}
                className="w-full border rounded px-3 py-2"
            />
            </div>

            <div>
            <label className="block font-medium mb-2">Ảnh không nền</label>
            {productColor.noBgImgPreview && (
                <img 
                src={productColor.noBgImgPreview} 
                alt="Preview" 
                className="w-32 h-32 object-cover mb-2 rounded" 
                />
            )}
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 w-fit">
                <Upload size={20} />
                Chọn ảnh
                <input
                type="file"
                accept="image/*"
                onChange={handleNoBgImageChange}
                className="hidden"
                />
            </label>
            </div>

            <div>
            <label className="block font-medium mb-2">Ảnh variants (nhiều ảnh)</label>
            {productColor.productVariantImagePreviews && productColor.productVariantImagePreviews.length > 0 && (
                <div className="flex gap-2 mb-2 flex-wrap">
                {productColor.productVariantImagePreviews.map((url: string, idx: number) => (
                    <img 
                    key={idx} 
                    src={url} 
                    alt={`Preview ${idx}`} 
                    className="w-20 h-20 object-cover rounded" 
                    />
                ))}
                </div>
            )}
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 w-fit">
                <Upload size={20} />
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
            <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">Biến thể</h4>
                <button
                type="button"
                onClick={onAddVariant}
                className="flex items-center gap-2 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                <Plus size={16} />
                Thêm biến thể
                </button>
            </div>

            {productColor.variants?.map((variant, variantIndex) => (
                <UpdateVariantItem
                key={variantIndex}
                variant={variant}
                variantIndex={variantIndex}
                sizes={sizes}
                onUpdate={(field, value) => onUpdateVariant(variantIndex, field, value)}
                onRemove={() => onRemoveVariant(variantIndex)}
                />
            ))}
            </div>
        </div>
        </div>
    );
}