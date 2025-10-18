// src/app/admin/product/create/components/ImageUploader.tsx
"use client";

import { Upload, X } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

interface ImageUploaderProps {
    label: string;
    selectedFile: File | null;
    onFileChange: (file: File | null) => void;
}

export default function ImageUploader({
    label,
    selectedFile,
    onFileChange,
}: ImageUploaderProps) {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedFile) {
            setPreview(null);
            return;
        }
        // Kiểm tra nếu file là object (File) thì mới tạo URL
        if (typeof selectedFile === 'object' && selectedFile.name) {
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreview(objectUrl);

            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [selectedFile]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        onFileChange(file || null);
    };

    const handleRemoveImage = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onFileChange(null);
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
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
                {label}
            </label>
            <label
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="relative flex flex-col items-center justify-center w-80 h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
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
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full z-10 hover:bg-red-700 shadow"
                        >
                            <X size={16} />
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                        <Upload size={32} className="text-gray-400 mb-2" />
                            <p className="mb-1 text-xs text-gray-500">
                                <span className="font-semibold">Nhấn để tải lên</span> hoặc kéo
                                thả
                            </p>
                    </div>
                )}
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                />
            </label>
        </div>
    );
}