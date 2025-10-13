// src/app/admin/product/update/[productId]/components/UpdateBasicInfoSection.tsx
import { Upload } from 'lucide-react';
import { Category } from '@/models/RequestUpdateProduct';

interface UpdateBasicInfoSectionProps {
    productName: string;
    description: string;
    price: number | '';
    categoryId: number | '';
    mainImagePreview: string;
    categories: Category[];
    onUpdate: (field: string, value: any) => void;
}

export default function UpdateBasicInfoSection({
    productName,
    description,
    price,
    categoryId,
    mainImagePreview,
    categories,
    onUpdate,
}: UpdateBasicInfoSectionProps) {
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        onUpdate('mainImageUrl', file);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Thông tin cơ bản</h2>

        <div className="space-y-4">
            <div>
            <label className="block font-medium mb-2">Tên sản phẩm</label>
            <input
                type="text"
                value={productName}
                onChange={(e) => onUpdate('productName', e.target.value)}
                className="w-full border rounded px-3 py-2"
            />
            </div>

            <div>
            <label className="block font-medium mb-2">Mô tả</label>
            <textarea
                value={description}
                onChange={(e) => onUpdate('description', e.target.value)}
                className="w-full border rounded px-3 py-2"
                rows={4}
            />
            </div>

            <div>
            <label className="block font-medium mb-2">Giá</label>
            <input
                type="number"
                value={price}
                onChange={(e) => onUpdate('price', e.target.value ? parseFloat(e.target.value) : '')}
                className="w-full border rounded px-3 py-2"
            />
            </div>

            <div>
            <label className="block font-medium mb-2">Danh mục</label>
            <select
                value={categoryId}
                onChange={(e) => onUpdate('categoryId', e.target.value ? parseInt(e.target.value) : '')}
                className="w-full border rounded px-3 py-2"
            >
                <option value="">Chọn danh mục</option>
                {categories.map(cat => (
                <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                </option>
                ))}
            </select>
            </div>

            <div>
            <label className="block font-medium mb-2">Ảnh chính</label>
            {mainImagePreview && (
                <img 
                src={mainImagePreview} 
                alt="Preview" 
                className="w-32 h-32 object-cover mb-2 rounded" 
                />
            )}
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 w-fit">
                <Upload size={20} />
                Chọn ảnh mới
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