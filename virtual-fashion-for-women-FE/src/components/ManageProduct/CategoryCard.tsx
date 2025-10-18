// src/app/admin/product/create/components/CategoryCard.tsx
import { Category } from "@/models/RequestCreateProduct";

interface CategoryCardProps {
  categoryId: number;
  categories: Category[];
  onUpdate: (field: string, value: any) => void;
  // Xóa onAddCategoryClick
}

export default function CategoryCard({
    categoryId,
    categories,
    onUpdate,
}: CategoryCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Danh Mục *</h2>
        <select
            required
            value={categoryId}
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
        {/* Xóa nút Thêm Danh Mục Mới */}
        </div>
    );
}