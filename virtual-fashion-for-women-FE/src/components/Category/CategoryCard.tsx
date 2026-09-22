import { Category } from "@/types/category";

export default function CategoryCard({
    category,
    onEdit,
    onDelete,
    onEditTemplate,
}: {
    category: Category;
    onEdit: () => void;
    onDelete: () => void;
    onEditTemplate: () => void;
}) {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl">
            {/* Phần nội dung */}
            <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {category.categoryName}
                </h3>
                <p className="text-gray-600 text-sm">{category.bodyPart}</p>
                
                {/* Đường kẻ ngang */}
                <hr className="my-4" />
                
                {/* Nút Bấm */}
                <div className="flex justify-start gap-3">
                    <button
                        onClick={onDelete}
                        className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors cursor-pointer"
                    >
                        Xóa
                    </button>
                    <button
                        onClick={onEdit}
                        className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors cursor-pointer"
                    >
                        Sửa
                    </button>
                    <button
                        onClick={onEditTemplate}
                        className="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors cursor-pointer"
                    >
                        Chỉnh Bảng Size
                    </button>
                </div>
            </div>
        </div>
    );
}