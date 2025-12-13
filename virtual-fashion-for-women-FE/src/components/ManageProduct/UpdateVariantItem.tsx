// src/app/admin/product/update/[productId]/components/UpdateVariantItem.tsx
import { X, Upload } from 'lucide-react';
import { Size, UpdateProductVariantFormData } from '@/models/RequestUpdateProduct';

interface UpdateVariantItemProps {
    variant: UpdateProductVariantFormData;
    variantIndex: number;
    sizes: Size[];
    onUpdate: (field: string, value: any) => void;
    onRemove: () => void;
    usedSizeIds: number[];
}

export default function UpdateVariantItem({
    variant,
    variantIndex,
    sizes,
    onUpdate,
    onRemove,
    usedSizeIds,
}: UpdateVariantItemProps) {
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpdate('imageUrl', file);
            onUpdate('imagePreview', URL.createObjectURL(file));
        }
    };

    // Hàm xử lý khi click vào badge trạng thái
    const toggleStatus = () => {
        const newStatus = variant.status === 'Active' ? 'Inactive' : 'Active';
        onUpdate('status', newStatus);
    };

    const isActive = variant.status === 'Active';

    const handleNumericChange = (
        field: string,
        value: string,
        max: number,
        isInteger: boolean = false
    ) => {
        if (value === "") {
            onUpdate(field, undefined);
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
        // Đổi nền sang bg-white và thêm border
        <div className="bg-white p-4 mb-3 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-gray-800">Size {variantIndex + 1}</span>
                {/* Cụm nút bên phải */}
                <div className="flex items-center gap-3">
                    <button
                         type="button"
                         onClick={toggleStatus}
                         title={`Click để đổi sang ${isActive ? 'Inactive' : 'Active'}`}
                         className={`px-3 py-0.5 text-xs font-medium rounded-full cursor-pointer transition-all ${
                            isActive
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                    >
                         {isActive ? 'Active' : 'Inactive'}
                    </button>
                    {/* <button
                        type="button"
                        onClick={onRemove}
                        className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                        <X size={18} />
                    </button> */}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Tên biến thể</label>
                    <input
                        type="text"
                        value={variant.variantName || ''}
                        onChange={(e) => onUpdate('variantName', e.target.value)}
                        placeholder="VD: Xanh navy size L"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </div>

             	<div>
             		<label className="block text-sm font-medium mb-1">Chọn size *</label>
             		<select
             			value={variant.sizeId || ''}
             			onChange={(e) => onUpdate('sizeId', e.target.value ? parseInt(e.target.value) : undefined)}
             			className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
             		>
             			<option value="">-- Chọn size --</option>
                        {sizes.map(size => {
                            // <-- THÊM LOGIC VÔ HIỆU HÓA SIZE
                            const isUsedByAnother = 
                                usedSizeIds.includes(size.sizeId) && size.sizeId !== variant.sizeId;
                            return (
                                <option 
                                    key={size.sizeId} 
                                    value={size.sizeId}
                                    disabled={isUsedByAnother}
                                    className={isUsedByAnother ? "text-gray-300 bg-gray-200" : ""}
                                >
                                    {size.sizeCode}
                                </option>
                            );
                        })}
             		</select>
         	    </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Số lượng *</label>
                    <input
                        type="number"
                        min="0"
                        max="9999"
                        value={variant.quantity || ''}
                        onChange={(e) => 
                            handleNumericChange('quantity', e.target.value, 9999, true)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </div>
                {/* BỎ TRƯỜNG TRẠNG THÁI (STATUS) ĐỂ GIỐNG HÌNH ẢNH */}

                <div>
                    <label className="block text-sm font-medium mb-1">Cân nặng (kg)</label>
                    <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="10"
                        value={variant.productWeight || ''}
                        onChange={(e) => 
                            handleNumericChange('productWeight', e.target.value, 10)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Chiều dài (cm)</label>
                    <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="100"
                        value={variant.productLength || ''}
                        onChange={(e) =>
                            handleNumericChange('productLength', e.target.value, 100)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Dài áo/quần (cm)</label>
                    <input
                        type="number"
                        step="1"
                        min="20"
                        max="200"
                        value={variant.clothesLength || ''}
                        onChange={(e) => {
                            handleNumericChange('clothesLength', e.target.value, 200, true);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Chiều rộng (cm)</label>
                    <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="100"
                        value={variant.productWidth || 0.1}
                        onChange={(e) => {
                            handleNumericChange('productWidth', e.target.value, 100);
                        }}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Chiều cao (cm)</label>
                    <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="100"
                        value={variant.productHeight || 0.1}
                        onChange={(e) => 
                            handleNumericChange('productHeight', e.target.value, 100)
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Ảnh variant *</label>
                    {variant.imagePreview && (
                        <img 
                            src={variant.imagePreview} 
                            alt="Preview" 
                            className="w-24 h-24 object-cover mb-2 rounded border" 
                        />
                    )}
                    <label className="flex items-center gap-2 px-3 py-2 bg-white text-blue-600 rounded-lg cursor-pointer hover:bg-gray-100 border border-blue-500 w-fit text-sm">
                        <Upload size={16} />
                        {variant.imagePreview ? 'Đổi ảnh' : 'Chọn ảnh'}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </label>
                </div>
     	    </div>
        </div>
    );
}