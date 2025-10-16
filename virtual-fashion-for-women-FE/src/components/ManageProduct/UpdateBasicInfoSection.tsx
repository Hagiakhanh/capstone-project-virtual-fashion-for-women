import { Upload } from "lucide-react";
import { Category } from "@/models/RequestUpdateProduct";

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
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpdate("mainImageUrl", file);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Thông Tin Cơ Bản</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên sản phẩm
                    </label>
                    <input
                        type="text"
                        value={productName}
                        onChange={(e) => onUpdate("productName", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => onUpdate("description", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Giá
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="1000"
                            value={price}
                            onChange={(e) => onUpdate("price", e.target.value ? parseFloat(e.target.value) : '')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Danh mục
                        </label>
                        <select
                            value={categoryId}
                            onChange={(e) => onUpdate("categoryId", e.target.value ? parseInt(e.target.value) : '')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map((category) => (
                                <option key={category.categoryId} value={category.categoryId}>
                                    {category.categoryName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ảnh chính
                    </label>
                    {mainImagePreview && (
                        <div className="mb-3">
                            <img 
                                src={mainImagePreview} 
                                alt="Main product" 
                                className="w-40 h-40 object-cover rounded-lg border"
                            />
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600">
                            <Upload size={20} />
                            Đổi ảnh
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}