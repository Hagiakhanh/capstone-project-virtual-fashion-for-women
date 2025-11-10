"use client";

import { Upload } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  label: string;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  error?: string;
  imageDefaultUrl?: string;
}

export default function ImageUploader({
  label,
  selectedFile,
  onFileChange,
  error,
  imageDefaultUrl,
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }

    if (typeof selectedFile === "object" && selectedFile.name) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [selectedFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    onFileChange(file || null);
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

  const imageToShow = preview || imageDefaultUrl || null;

  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">
        {label}
      </label>
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`relative flex items-center justify-center w-80 h-48 border-2 border-dashed rounded-lg cursor-pointer overflow-hidden bg-gray-50 hover:bg-gray-100 transition-colors ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      >
        {imageToShow ? (
          <>
            {/* Ảnh hiển thị */}
            <Image
              src={imageToShow}
              alt="Preview"
              fill
              style={{ objectFit: "cover" }}
              className="rounded-lg"
            />

            {/* Overlay mờ */}
            <div className="absolute inset-0 bg-black/20 hover:bg-black/30 flex flex-col items-center justify-center opacity-100 transition">
              <Upload size={28} className="text-white mb-1" />
              <span className="text-xs text-white font-medium">
                Nhấn để đổi ảnh
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <Upload size={32} className="text-gray-400 mb-2" />
            <p className="mb-1 text-xs text-gray-500">
              <span className="font-semibold">Nhấn để tải lên</span> hoặc kéo thả
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

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
