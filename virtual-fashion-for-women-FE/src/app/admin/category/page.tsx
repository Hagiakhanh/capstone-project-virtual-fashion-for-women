// app/dashboard/categories/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { Category, CategoryFormData } from "@/types/category";
import CategoryCard from "@/components/Category/CategoryCard";
import CategoryModal from "@/components/Category/CategoryModal";
import DeleteConfirmModal from "@/components/Category/DeleteConfirmModal";
import { Size } from "@/types/size";
import CategorySizeTemplateModal from "@/components/Category/CategorySizeTemplateModal";
// Giả sử bạn có 1 component toast message
import { messageToast } from "@/helpers/toastHelper";
import { api } from "@/api/instance";

export default function CategoryManagementPage() {
    const [categories, setCategories] = useState<Category[]>([]);

    const [allSizes, setAllSizes] = useState<Size[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State cho modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        null
    );

    // State cho modal Size Template (MỚI)
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    // Dùng state riêng để tránh nhầm lẫn với selectedCategory
    const [categoryForTemplate, setCategoryForTemplate] = useState<Category | null>(null);

    // Hàm fetch dữ liệu
    const fetchMasterData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Dùng Promise.all như ví dụ của bạn
            const [categoriesRes, sizesRes] = await Promise.all([
                api.get("/category"), // Gọi route handler
                api.get("/size"),     // Gọi route handler
            ]);

            setCategories(
                Array.isArray(categoriesRes.data) ? categoriesRes.data : []
            );
            setAllSizes(Array.isArray(sizesRes.data) ? sizesRes.data : []);
        } catch (err: any) {
            const errMsg = err.response?.data?.message || err.message || "Lỗi không xác định";
            setError(errMsg);
            messageToast.error(errMsg);
            console.error("Error fetching master data:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch dữ liệu khi component được mount
    useEffect(() => {
        //fetchCategories();
        fetchMasterData();
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
        setIsTemplateModalOpen(false); // <-- Đóng cả modal template
        setSelectedCategory(null);
        setCategoryForTemplate(null); // <-- Reset cả state template
    };

    // Xử lý Save (Create hoặc Update)
    const handleSave = async (formData: CategoryFormData) => {
        try {
            let response;
            if (selectedCategory) {
                // Update
                response = await api.put(
                    `/category/${selectedCategory.categoryId}`,
                    formData
                );
            } else {
                // Create
                response = await api.post("/category", formData);
            }

            if (response.status === 200 || response.status === 201) {
                messageToast.success(response.data.message || "Thao tác thành công");
                handleCloseModals();
                fetchMasterData(); // Tải lại danh sách
            } else {
                throw new Error(response.data.message || "Thao tác thất bại");
            }
        } catch (err: any) {
            const errMsg = err.response?.data?.message || err.message || "Lỗi không xác định";
            messageToast.error(errMsg);
            console.error("Error saving category:", err);
        }
    };

    // Xử lý Delete
    const handleDelete = async () => {
        if (!selectedCategory) return;

        try {
            const response = await api.delete(
                `/category/${selectedCategory.categoryId}`
            );
            
            if (response.status === 200) {
                messageToast.success(response.data.message || "Xóa thành công");
                handleCloseModals();
                fetchMasterData(); // Tải lại danh sách
            } else {
                throw new Error(response.data.message || "Xóa thất bại");
            }
        } catch (err: any) {
            const errMsg = err.response?.data?.message || err.message || "Lỗi không xác định";
            messageToast.error(errMsg);
            console.error("Error deleting category:", err);
        }
    };

    const handleOpenTemplateModal = (category: Category) => {
        setCategoryForTemplate(category);
        setIsTemplateModalOpen(true);
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
                    className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
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
                        onEditTemplate={() => handleOpenTemplateModal(category)} // <-- Truyền hàm
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
            {/* Modal MỚI cho Size Template */}
            {isTemplateModalOpen && (
                <CategorySizeTemplateModal
                    isOpen={isTemplateModalOpen}
                    onClose={handleCloseModals}
                    category={categoryForTemplate}
                    allSizes={allSizes}
                    onSaveSuccess={() => {
                        messageToast.success("Cập nhật bảng size thành công!");
                        handleCloseModals();
                        // Không cần fetch lại vì data này không hiển thị ở page
                    }}
                />
            )}
        </div>
    );
}