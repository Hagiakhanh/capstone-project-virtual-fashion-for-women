// src/app/admin/product/create/components/UploadImgCard.tsx
"use client";

import { Upload, X } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

interface UploadImgCardProps {
    mainImageUrl: File | null;
    onFileChange: (file: File | null) => void;
}

export default function UploadImgCard({
    mainImageUrl,
    onFileChange,
}: UploadImgCardProps) {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!mainImageUrl) {
        setPreview(null);
        return;
        }
        const objectUrl = URL.createObjectURL(mainImageUrl);
        setPreview(objectUrl);

        // Giải phóng bộ nhớ khi component unmount
        return () => URL.revokeObjectURL(objectUrl);
    }, [mainImageUrl]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
        onFileChange(file);
        }
    };

    const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault(); // Ngăn label trigger input file
        e.stopPropagation();
        onFileChange(null);
        setPreview(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith("image/")) {
        onFileChange(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
            Ảnh Sản Phẩm Chính *
        </h2>
        <div className="w-full">
            <label
                htmlFor="main-image-upload"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                {preview ? (
                    <>
                    <Image
                        src={preview}
                        alt="Xem trước"
                        layout="fill"
                        objectFit="contain"
                        className="rounded-lg p-2"
                    />
                    <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full z-10 hover:bg-red-700 shadow-md"
                    >
                        <X size={18} />
                    </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload size={40} className="text-gray-400 mb-3" />
                        <p className="mb-2 text-sm text-gray-500 text-center">
                            <span className="font-semibold">Nhấn để tải lên</span> hoặc kéo
                            thả
                        </p>
                        <p className="text-xs text-gray-500">
                            PNG, JPG, WEBP (Tối đa 5MB)
                        </p>
                    </div>
                )}
                <input
                    id="main-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                />
            </label>
        </div>
        </div>
    );
}