// components/Size/SizeCard.tsx
import { Size } from "@/types/size"; // <-- Thay đổi

export default function SizeCard({ // <-- Thay đổi
    size, // <-- Thay đổi
    onEdit,
    onDelete,
}: {
    size: Size; // <-- Thay đổi
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-xl">
            {/* Phần nội dung */}
            <div className="p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {size.sizeCode} {/* <-- Thay đổi */}
                </h3>
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
                </div>
            </div>
        </div>
    );
}