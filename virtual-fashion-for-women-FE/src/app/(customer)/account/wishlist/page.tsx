// app/wishlist/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Wishlist, WishlistApiResponse } from '@/models/WishlistDTO'; // Import từ file types
import { api } from "@/api/instance";
import { PaginationDTO } from '@/models/PaginationDTO';
import formatPrice from '@/utils/formatPrice';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Link from "next/link";

const CloseIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export default function WishlistPage() {
    const [items, setItems] = useState<Wishlist[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationDTO>({
            CurrentPage: 1,
            HasNext: false,
            HasPrevious: false,
            PageSize: 6,
            TotalCount: 0,
            TotalPages: 0,
        });
    const router = useRouter();

    
    const fetchWishlist = async () => {
    try {
        setLoading(true);

        const payloadPagination = {
            pageNumber: pagination.CurrentPage,
            pageSize: pagination.PageSize
        };

        const response = await api.get("/wishlist", { params: payloadPagination });

        if (response.status === 200) {
            setItems(response.data.data);

            // cập nhật thông tin phân trang dựa trên header x-pagination từ API route
            if (response.data.pagination) {
                setPagination((prev) => ({
                    ...prev,
                    ...response.data.pagination
                }));
            }
        }
    } catch (error: any) {
        setError(error.message || "Đã xảy ra lỗi khi tải danh sách.");
    } finally {
        setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.TotalPages) {
            setPagination((prev) => ({ ...prev, CurrentPage: newPage }));
        }
    };
    function getPageNumbers(totalPages: number, currentPage: number, delta = 2): (number | string)[] {
        const range: (number | string)[] = [];
        const left = Math.max(2, currentPage - delta);
        const right = Math.min(totalPages - 1, currentPage + delta);
        range.push(1);
        if (left > 2) {
            range.push("...");
        }
        for (let i = left; i <= right; i++) {
            range.push(i);
        }
        if (right < totalPages - 1) {
            range.push("...");
        }
        if (totalPages > 1) {
            range.push(totalPages);
        }
        return range;
    }

    useEffect(() => {
        fetchWishlist();
    }, [pagination.CurrentPage, pagination.PageSize]);


    // 3. Hàm xử lý khi nhấn nút X (xóa)
    const handleRemoveFromWishlist = async (wishlistId: number) => {
        try {
            const response = await api.delete(`/wishlist/${wishlistId}`);

            if (response.status === 200) {
                setItems((prevItems) =>
                    prevItems.filter((item) => item.wishlistId !== wishlistId)
                );
                if (items.length === 1 && pagination.CurrentPage > 1) {
                    handlePageChange(pagination.CurrentPage - 1);
                } else {
                    fetchWishlist();
                }
                toast.success("Đã xóa khỏi danh sách yêu thích!");
                console.log(response.data.message);
            } else {
                toast.error("Xóa khỏi danh sách yêu thích thất bại.");
            }
        } catch (error: any) {
            toast.error("Đã xảy ra lỗi. Vui lòng thử lại.");
            console.error("Lỗi khi xóa khỏi wishlist:", error);
        }
    };
    
    if (loading) {
        return <div className="p-10 text-center">Đang tải...</div>;
    }

    if (error) {
        return <div className="p-10 text-center text-red-500">Lỗi: {error}</div>;
    }

    return (
        <div className="max-w-6xl mx-auto p-4 font-sans">
            <h1 className="text-3xl font-bold mb-6">Danh sách yêu thích của bạn</h1>
            
            {items.length === 0 ? (
                <p className="text-gray-600">Danh sách yêu thích của bạn đang rỗng.</p>
            ) : (
                <ul className="space-y-4">
                    {items.map((item) => (
                        <li
                            key={item.wishlistId}
                                className="flex items-center bg-white p-4 pr-6 rounded-lg shadow-sm border border-purple-100 relative"
                            >
                            {/* Nút X để xóa (giống trong hình) */}
                            <button
                                onClick={() => handleRemoveFromWishlist(item.wishlistId)}
                                className="absolute top-2 right-3 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                                aria-label="Remove from wishlist"
                            >
                                <CloseIcon />
                            </button>

                            {/* Hình ảnh sản phẩm */}
                            <div className="flex-shrink-0 mr-5">
                                <Image
                                    src={item.product.mainImageUrl} // Lấy từ product include
                                    alt={item.product.productName}
                                    width={100} // Kích thước thực tế
                                    height={100}
                                    className="rounded-md object-cover w-24 h-24" // CSS cho kích thước
                                />
                            </div>

                            {/* Thông tin sản phẩm */}
                            <div className="flex-grow">
                                <h3 className="text-lg font-semibold text-black-700">
                                    {item.product.productName} {/* Lấy từ product include */}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1 max-w-3xl line-clamp-2">
                                    {item.product.description} {/* Lấy từ product include */}
                                </p>
                            </div>

                            {/* Giá và Nút Add to Cart */}
                            <Link href={`/products/${item.product.productSlug}`}>
                                <div className="flex flex-col items-end ml-4 flex-shrink-0 w-40">
                                    <span className="text-xl font-bold text-gray-900 mb-3">
                                        <div className="text-black font-bold text-xl whitespace-nowrap">
                                            {formatPrice(item.product.price ?? 0)}đ
                                        </div>
                                    </span>
                                    <button
                                        //onClick={() => handleAddToCart(item.product.productId)}
                                        className="flex items-center justify-center bg-purple-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-purple-700 transition-colors cursor-pointer"
                                    >
                                        <span>Xem chi tiết</span>
                                    </button>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            <div className="flex justify-center items-center gap-3 mt-8">
                {/* Nút trước */}
                <button
                    disabled={pagination.CurrentPage === 1}
                    onClick={() => handlePageChange(pagination.CurrentPage - 1)}
                    className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                    « Trước
                </button>

                {getPageNumbers(pagination.TotalPages, pagination.CurrentPage).map((page, idx) => (
                    <button
                        key={idx}
                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                        disabled={page === "..."}
                        className={`px-4 py-2 rounded-lg border transition-all cursor-pointer ${pagination.CurrentPage === page
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white hover:bg-gray-100'
                            } ${page === "..." ? 'cursor-default opacity-70' : ''}`}
                    >
                        {page}
                    </button>
                ))}

                {/* Nút sau */}
                <button
                    disabled={pagination.CurrentPage === pagination.TotalPages}
                    onClick={() => handlePageChange(pagination.CurrentPage + 1)}
                    className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                    Sau »
                </button>
            </div>
        </div>
    );
}