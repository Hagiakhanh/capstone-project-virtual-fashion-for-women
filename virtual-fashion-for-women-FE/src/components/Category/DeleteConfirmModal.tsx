export default function DeleteConfirmModal({
    isOpen,
    onClose,
    onDelete,
    categoryName,
}: {
    isOpen: boolean;
    onClose: () => void;
    onDelete: () => void;
    categoryName?: string;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm">
                <h2 className="text-xl font-bold mb-4">Xác nhận Xóa</h2>
                <p>
                    Bạn có chắc chắn muốn xóa danh mục{" "}
                    <strong className="text-red-600">{categoryName}</strong>? Hành động
                        này không thể hoàn tác.
                </p>
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 cursor-pointer"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={onDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 cursor-pointer"
                    >
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    );
}