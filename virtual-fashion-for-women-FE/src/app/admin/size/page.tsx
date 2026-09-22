"use client";

import { useState, useEffect, FormEvent } from "react";
import { api } from "@/api/instance";
import { Size, SizeFormData } from "@/types/size";
import SizeCard from "@/components/Size/SizeCard";
import SizeModal from "@/components/Size/SizeModal";
import DeleteConfirmModal from "@/components/Category/DeleteConfirmModal";

export default function SizeManagementPage() {
    const [sizes, setSizes] = useState<Size[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State cho modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedSize, setSelectedSize] = useState<Size | null>(
        null
    );

    // Hàm fetch dữ liệu - Dùng axios
    const fetchSizes = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get("/size"); // <-- Đã đổi sang axios
            setSizes(response.data); // axios trả dữ liệu trong .data
        } catch (err: any) {
            const errMsg = err.response?.data?.message || err.message || "Lỗi khi tải danh sách kích thước";
            setError(errMsg);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch dữ liệu khi component được mount
    useEffect(() => {
        fetchSizes();
    }, []);

    // === CÁC HÀM XỬ LÝ ===

    const handleOpenCreateModal = () => {
        setSelectedSize(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (size: Size) => {
        setSelectedSize(size);
        setIsModalOpen(true);
    };

    const handleOpenDeleteModal = (size: Size) => {
        setSelectedSize(size);
        setIsDeleteModalOpen(true);
    };

    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedSize(null);
    };

    const handleSave = async (formData: SizeFormData) => {
        try {
            if (selectedSize) {
                await api.put(`/size/${selectedSize.sizeId}`, { sizeCode: formData.sizeCode });
            } else {
                // CREATE (POST) - Gửi JSON body (theo C# API [FromBody])
                const payload = {
                    sizeCode: formData.sizeCode
                };
                await api.post("/size", payload);
            }

            handleCloseModals();
            fetchSizes(); // Tải lại danh sách
        } catch (err: any) {
            // Hiển thị lỗi cho người dùng
            const errMsg = err.response?.data?.message || err.message || "Thao tác thất bại";
            alert(`Lỗi: ${errMsg}`);
        }
    };

    // Xử lý Delete - Dùng axios
    const handleDelete = async () => {
        if (!selectedSize) return;

        try {
            await api.delete(`/size/${selectedSize.sizeId}`); // <-- Đã đổi sang axios

            handleCloseModals();
            fetchSizes(); // Tải lại danh sách
        } catch (err: any) {
            const errMsg = err.response?.data?.message || err.message || "Xóa thất bại";
            alert(`Lỗi: ${errMsg}`);
        }
    };

    // === RENDER ===

    if (isLoading) return <div className="p-8">Đang tải...</div>;
    if (error) return <div className="p-8 text-red-500">Lỗi: {error}</div>;

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            {/* Thanh Header: Tiêu đề và Nút Add New */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Quản lý Kích thước</h1>
                <button
                    onClick={handleOpenCreateModal}
                    className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
                >
                    + Thêm Kích thước mới
                </button>
            </div>

            {/* Lưới hiển thị các Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sizes.map((size) => (
                    <SizeCard
                        key={size.sizeId}
                        size={size}
                        onEdit={() => handleOpenEditModal(size)}
                        onDelete={() => handleOpenDeleteModal(size)}
                    />
                ))}
            </div>

            {/* Modals */}
            <SizeModal
                isOpen={isModalOpen}
                onClose={handleCloseModals}
                onSave={handleSave}
                size={selectedSize}
            />
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={handleCloseModals}
                onDelete={handleDelete}
                categoryName={selectedSize?.sizeCode}
            />
        </div>
    );
}