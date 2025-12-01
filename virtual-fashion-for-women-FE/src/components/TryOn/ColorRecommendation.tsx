'use client';
import React, { useState, useMemo, useEffect, useRef } from "react";
import { X, Search } from "lucide-react";
import { Category } from "@/models/RequestCreateProduct";
import { api } from "@/api/instance";
import LoadingSpinner from "../Loading/LoadingSpinner";

export default function ColorRecommendation({
    category = [],
    selectedHexcode,
    onClose,
    onSelect,
}: {
    category?: Category[];
    selectedHexcode?: string;
    onClose: () => void;
    onSelect: (item: {
        productColorId: string;
        noBgImgUrl: string;
        productName: string;
        categoryId: number;
        [key: string]: any; // cho phép thêm field khác từ API
    }) => void;
}) {
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        category[0] || null
    );
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const fetchColorRecommendationProduct = async () => {
        setLoading(true);
        try {
            const response = await api.get('/color-recommendation', {
                params: {
                    PageIndex: 1,
                    PageSize: 100,
                    Hexcode: selectedHexcode,
                    CategoryName: selectedCategory?.categoryName || ''
                }
            });
            if (response.status === 200) {
                const data = response.data;

                const productColorsWithProductInfo = data.flatMap((product: any) =>
                    product.productColors.map((color: any) => ({
                        ...color,
                        productName: product.productName + "-" + color.color.colorName,
                        categoryId: product.categoryId,
                    }))
                );

                setProducts(productColorsWithProductInfo);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!selectedCategory || !selectedHexcode) return;
        fetchColorRecommendationProduct();
    }, [selectedCategory, selectedHexcode]);

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-3 md:p-4"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-4 md:p-6 relative max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 md:top-4 md:right-4 text-gray-500 hover:text-gray-700 z-10"
                >
                    <X size={20} className="md:w-[22px] md:h-[22px]" />
                </button>

                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 md:mb-4 text-gray-800 text-center pr-8 leading-tight">
                    Các sản phẩm gợi ý phù hợp với màu bạn chọn
                </h2>

                {/* Category buttons */}
                {category.length > 0 && (
                    <div className="mb-3 md:mb-4 -mx-4 md:mx-0 px-4 md:px-0 overflow-hidden">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {category.map((c) => (
                                <button
                                    key={c.categoryId}
                                    onClick={() => setSelectedCategory(c)}
                                    disabled={loading}
                                    className={`px-3 md:px-4 py-1.5 rounded-full border text-xs md:text-sm font-medium transition flex-shrink-0 ${selectedCategory?.categoryId === c.categoryId
                                            ? "bg-orange-500 text-white border-orange-500"
                                            : "bg-white border-gray-300 hover:border-orange-400 hover:text-orange-500"
                                        } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                                >
                                    {c.categoryName}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Products grid */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size={50} />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 pr-2">
                            {products.length > 0 ? (
                                products.map((item, index) => (
                                    <div
                                        key={index}
                                        onClick={() => onSelect(item)}
                                        className="flex flex-col items-center gap-2 p-2 md:p-3 rounded-lg hover:bg-orange-50 cursor-pointer transition border border-transparent hover:border-orange-300"
                                    >
                                        <img
                                            src={item.noBgImgUrl}
                                            alt={item.productName}
                                            className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover"
                                        />
                                        <div className="text-center w-full">
                                            <p className="font-medium text-gray-800 text-xs md:text-sm line-clamp-2">
                                                {item.productName}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="col-span-2 md:col-span-3 text-center text-gray-500 py-6 text-sm">
                                    Không tìm thấy sản phẩm nào
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end mt-4 md:mt-6 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-200 text-gray-800 text-sm md:text-base font-medium hover:bg-gray-300 transition-colors"
                    >
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
}
