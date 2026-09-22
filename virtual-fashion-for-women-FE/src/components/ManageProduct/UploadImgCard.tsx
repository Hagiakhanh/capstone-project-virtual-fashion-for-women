// src/app/admin/product/create/components/UploadImgCard.tsx
"use client";

// Import ImageUploader thay vì tự viết logic
import ImageUploader from "./ImageUploader"; 

interface UploadImgCardProps {
    mainImageUrl: File | null;
    onFileChange: (file: File | null) => void;
    error?: string;
}

export default function UploadImgCard({
    mainImageUrl,
    onFileChange,
    error,
}: UploadImgCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
                Ảnh Sản Phẩm Chính *
            </h2>
            <div className="w-full">
                {/* Chỉ cần gọi ImageUploader và truyền props */}
                <ImageUploader
                    label="" // Bạn có thể ẩn label nếu muốn
                    selectedFile={mainImageUrl}
                    onFileChange={onFileChange}
                    error={error}
                />
            </div>
        </div>
    );
}