import { Upload } from "lucide-react";
import { Category } from "@/models/RequestCreateProduct";

interface BasicInfoSectionProps {
    formData: {
        productName: string;
        description: string;
        price: number;
        categoryId: number;
        mainImageUrl: File | null;
    };
    categories: Category[];
    onUpdate: (field: string, value: any) => void;
    onFileChange: (file: File) => void;
}

export default function BasicInfoSection({
    formData,
    categories,
    onUpdate,
    onFileChange,
}: BasicInfoSectionProps) {
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) onFileChange(file);
    };

    return (
        <div className="border-b pb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Thông Tin Cơ Bản</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên sản phẩm *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.productName}
                        onChange={(e) => onUpdate("productName", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label>
                    <textarea
                        required
                        value={formData.description}
                        onChange={(e) => onUpdate("description", e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Giá *</label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="1000"
                            value={formData.price}
                            onChange={(e) => onUpdate("price", parseFloat(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Danh mục *
                        </label>
                        <select
                            required
                            value={formData.categoryId}
                            onChange={(e) => onUpdate("categoryId", parseInt(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value={0}>-- Chọn danh mục --</option>
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
                        Ảnh chính *
                    </label>
                    <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600">
                            <Upload size={20} />
                            Chọn ảnh
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                        </label>
                        {formData.mainImageUrl && (
                            <span className="text-sm text-gray-600">{formData.mainImageUrl.name}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}