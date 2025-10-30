import React, { useState, useEffect, FormEvent } from "react";
import { Category, CategoryFormData } from "@/types/category";

export default function CategoryModal({
    isOpen,
    onClose,
    onSave,
    category,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: CategoryFormData) => void;
    category: Category | null;
}) {
    const [formData, setFormData] = useState<CategoryFormData>({
        categoryName: "",
        categorySlug: "",
        bodyPart: "",
    });

  // Load dữ liệu vào form khi mở modal Edit
    useEffect(() => {
        if (category) {
        setFormData({
            categoryName: category.categoryName,
            categorySlug: category.categorySlug,
            bodyPart: category.bodyPart,
        });
        } else {
        // Reset form khi mở modal Create
        setFormData({
            categoryName: "",
            categorySlug: "",
            bodyPart: "",
        });
        }
    }, [category, isOpen]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">
                    {category ? "Chỉnh sửa Danh mục" : "Tạo Danh mục mới"}
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên Danh mục (categoryName)
                        </label>
                        <input
                            type="text"
                            name="categoryName"
                            value={formData.categoryName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bộ phận (bodyPart)
                        </label>
                        <input
                            type="text"
                            name="bodyPart"
                            value={formData.bodyPart}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Slug (categorySlug)
                        </label>
                        <input
                            type="text"
                            name="categorySlug"
                            value={formData.categorySlug}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            required
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Lưu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}