// src/app/admin/product/update/[productId]/components/UpdateVariantItem.tsx
import { X, Upload } from 'lucide-react';
import { Size, UpdateProductVariantFormData } from '@/models/RequestUpdateProduct';

interface UpdateVariantItemProps {
    variant: UpdateProductVariantFormData;
    variantIndex: number;
    sizes: Size[];
    onUpdate: (field: string, value: any) => void;
    onRemove: () => void;
}

export default function UpdateVariantItem({
    variant,
    variantIndex,
    sizes,
    onUpdate,
    onRemove,
}: UpdateVariantItemProps) {
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        onUpdate('imageUrl', file);
        onUpdate('imagePreview', URL.createObjectURL(file));
        }
    };

    return (
        <div className="bg-gray-50 p-3 mb-3 rounded">
        <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Biến thể {variantIndex + 1}</span>
            <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 bg-red-500 text-white px-2 py-1 text-sm rounded hover:bg-red-600"
            >
            <X size={16} />
            Xóa
            </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
            {/* Size selection */}
            <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Chọn size có sẵn</label>
            <select
                value={variant.sizeId || ''}
                onChange={(e) => onUpdate('sizeId', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full border rounded px-2 py-1 text-sm"
            >
                <option value="">-- Hoặc tạo size mới --</option>
                {sizes.map(size => (
                <option key={size.sizeId} value={size.sizeId}>
                    {size.sizeCode}
                </option>
                ))}
            </select>
            </div>

            {/* Create new size */}
            {(!variant.sizeId || variant.sizeId === 0) && (
            <div className="col-span-2 bg-white p-2 rounded">
                <label className="block text-sm font-medium mb-1">Tạo size mới (VD: L, XL, 42)</label>
                <input
                type="text"
                placeholder="Size Code"
                value={variant.sizeCode || ''}
                onChange={(e) => onUpdate('sizeCode', e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
                />
            </div>
            )}

            <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Tên biến thể</label>
            <input
                type="text"
                value={variant.variantName || ''}
                onChange={(e) => onUpdate('variantName', e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
            />
            </div>

            <div>
            <label className="block text-sm font-medium mb-1">Số lượng</label>
            <input
                type="number"
                value={variant.quantity || ''}
                onChange={(e) => onUpdate('quantity', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full border rounded px-2 py-1 text-sm"
            />
            </div>

            <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select
                value={variant.status || 'Active'}
                onChange={(e) => onUpdate('status', e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
            >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
            </select>
            </div>

            <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Ảnh biến thể</label>
            {variant.imagePreview && (
                <img 
                src={variant.imagePreview} 
                alt="Preview" 
                className="w-20 h-20 object-cover mb-1 rounded" 
                />
            )}
            <label className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white text-sm rounded cursor-pointer hover:bg-blue-600 w-fit">
                <Upload size={16} />
                Chọn ảnh
                <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                />
            </label>
            </div>

            <div>
            <label className="block text-sm font-medium mb-1">Cân nặng (kg)</label>
            <input
                type="number"
                step="0.01"
                value={variant.productWeight || ''}
                onChange={(e) => onUpdate('productWeight', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full border rounded px-2 py-1 text-sm"
            />
            </div>

            <div>
            <label className="block text-sm font-medium mb-1">Chiều dài (cm)</label>
            <input
                type="number"
                step="0.01"
                value={variant.productLength || ''}
                onChange={(e) => onUpdate('productLength', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full border rounded px-2 py-1 text-sm"
            />
            </div>

            <div>
            <label className="block text-sm font-medium mb-1">Chiều rộng (cm)</label>
            <input
                type="number"
                step="0.01"
                value={variant.productWidth || ''}
                onChange={(e) => onUpdate('productWidth', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full border rounded px-2 py-1 text-sm"
            />
            </div>

            <div>
            <label className="block text-sm font-medium mb-1">Chiều cao (cm)</label>
            <input
                type="number"
                step="0.01"
                value={variant.productHeight || ''}
                onChange={(e) => onUpdate('productHeight', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full border rounded px-2 py-1 text-sm"
            />
            </div>
        </div>
        </div>
    );
}