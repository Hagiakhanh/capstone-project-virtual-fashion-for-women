// app/dashboard/categories/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { Category, CategoryFormData } from "@/types/category";
import CategoryCard from "@/components/Category/CategoryCard";
import CategoryModal from "@/components/Category/CategoryModal";
import DeleteConfirmModal from "@/components/Category/DeleteConfirmModal";

export default function CategoryManagementPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State cho modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null
    );

    // Hàm fetch dữ liệu
    const fetchCategories = async () => {
        setIsLoading(true);
        setError(null);
        try {
        const response = await fetch("/api/category");
        if (!response.ok) {
            throw new Error("Lỗi khi tải danh mục");
        }
        const data = await response.json();
        setCategories(data);
        } catch (err: any) {
        setError(err.message);
        } finally {
        setIsLoading(false);
        }
    };

  // Fetch dữ liệu khi component được mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // === CÁC HÀM XỬ LÝ ===

    const handleOpenCreateModal = () => {
        setSelectedCategory(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (category: Category) => {
        setSelectedCategory(category);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (category: Category) => {
        setSelectedCategory(category);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedCategory(null);
    };

    // Xử lý Save (Create hoặc Update)
    const handleSave = async (formData: CategoryFormData) => {
        const url = selectedCategory
        ? `/api/category/${selectedCategory.categoryId}` // Update
        : "/api/category"; // Create
        const method = selectedCategory ? "PUT" : "POST";

        try {
        const response = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || "Thao tác thất bại");
        }

        handleCloseModals();
        fetchCategories(); // Tải lại danh sách
        } catch (err: any) {
        alert(`Lỗi: ${err.message}`);
        }
    };

    // Xử lý Delete
    const handleDelete = async () => {
        if (!selectedCategory) return;

        try {
        const response = await fetch(
            `/api/category/${selectedCategory.categoryId}`,
            {
            method: "DELETE",
            }
        );

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || "Xóa thất bại");
        }

        handleCloseModals();
        fetchCategories(); // Tải lại danh sách
        } catch (err: any) {
        alert(`Lỗi: ${err.message}`);
        }
    };

  // === RENDER ===

    if (isLoading) return <div className="p-8">Đang tải...</div>;
    if (error) return <div className="p-8 text-red-500">Lỗi: {error}</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Thanh Header: Tiêu đề và Nút Add New */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Quản lý Danh mục</h1>
                <button
                    onClick={handleOpenCreateModal}
                    className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                >
                    + Thêm Danh mục mới
                </button>
            </div>

            {/* Lưới hiển thị các Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((category) => (
                    <CategoryCard
                        key={category.categoryId}
                        category={category}
                        onEdit={() => handleOpenEditModal(category)}
                        onDelete={() => handleOpenDeleteModal(category)}
                    />
                ))}
            </div>

            {/* Modals */}
            <CategoryModal
                isOpen={isModalOpen}
                onClose={handleCloseModals}
                onSave={handleSave}
                category={selectedCategory}
            />
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                onDelete={handleDelete}
                categoryName={selectedCategory?.categoryName}
            />
        </div>
    );
}