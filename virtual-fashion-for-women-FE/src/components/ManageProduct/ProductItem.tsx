'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import { Product } from '@/app/admin/product/page';

interface ProductItemProps {
    product: Product;
    onDelete: (productId: string) => void;
}

export default function ProductItem({ product, onDelete }: ProductItemProps) {
    const router = useRouter();

    return (
        <tr
            key={product.productId}
            className="hover:bg-gray-50 transition-colors text-[15px]"
        >
            {/* 🖼 Cột 1: Hình ảnh (to & rộng hơn) */}
            {/* ✅ THAY ĐỔI: Tăng chiều rộng cột từ 280px -> 360px */}
            <td className="px-6 py-4 whitespace-nowrap w-[280px]">
                <img
                    src={product.mainImageUrl || '/placeholder.png'}
                    alt={product.productName}
                    // ✅ THAY ĐỔI: Tăng kích thước ảnh từ h-40 w-64 -> h-48 w-80
                    className="h-48 w-64 rounded-md object-cover border border-gray-200 shadow-sm"
                />
            </td>

            {/* 🏷 Cột 2: Tên sản phẩm */}
            <td className="px-6 py-4 align-top w-[280px]">
                <div className="text-base font-semibold text-gray-900 leading-snug">
                    {product.productName}
                </div>
            </td>

            {/* 📝 Cột 3: Mô tả */}
            <td className="px-6 py-4 align-top w-[580px]">
                <div className="text-base text-gray-700 line-clamp-5">
                    {product.description || '—'}
                </div>
            </td>

            {/* 💰 Cột 4: Giá */}
            <td className="px-6 py-4 whitespace-nowrap align-top">
                <div className="text-lg font-bold text-gray-900">
                    {product.price?.toLocaleString('vi-VN')} đ
                </div>
            </td>

            {/* ⚙️ Cột 5: Trạng thái */}
            <td className="px-6 py-4 whitespace-nowrap align-top">
                <span
                    className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                        product.isDeleted
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                    }`}
                >
                    {product.isDeleted ? 'Đã xóa' : 'Hoạt động'}
                </span>
            </td>

            {/* 🛠 Cột 6: Thao tác */}
            <td className="px-6 py-4 whitespace-nowrap align-top">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() =>
                            router.push(`/admin/product/update/${product.productId}`)
                        }
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Sửa"
                    >
                        <Pencil className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onDelete(product.productId)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Xóa"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </td>
        </tr>
    );
}