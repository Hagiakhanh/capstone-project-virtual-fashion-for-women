import { Category } from "@/types/category";

export default function CategoryCard({
    category,
    onEdit,
    onDelete,
}: {
    category: Category;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl">
            {/* Phần ảnh placeholder (giống trong hình) */}
            {/* <div className="h-40 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Hình ảnh (nếu có)</span>
            </div> */}
            
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
                        className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                    >
                        Xóa
                    </button>
                    <button
                        onClick={onEdit}
                        className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                        Sửa
                    </button>
                </div>
            </div>
        </div>
    );
}