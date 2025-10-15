'use client';
import React, { useState, useMemo, useEffect } from "react";
import { X, Search } from "lucide-react";
import { Category } from "@/models/RequestCreateProduct";
import { api } from "@/api/instance";
import { on } from "events";

export default function SelectItemTryOn({
    category = [],
    onClose,
    onSelect,
    onReset,
}: {
    category?: Category[];
    onClose: () => void;
    onSelect: (item: { image: string; name: string; price: string }) => void;
    onReset: () => void;
}) {
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(
        category[0] || null
    );
    const [searchText, setSearchText] = useState("");
    const [products, setProducts] = useState<any[]>([]);

    const handFetchProducts = async () => {
        try {
            const response = await api.get('/product/search', {
                params: {
                    PageIndex: 1,
                    PageSize: 100,
                    ProductName: searchText,
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
        }
    }

    useEffect(() => {
        handFetchProducts();
    }, [selectedCategory, searchText]);

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                >
                    <X size={22} />
                </button>

                <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
                    Chọn một loại quần áo
                </h2>

                {/* Category buttons */}
                {category.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4 justify-center">
                        {category.map((c) => (
                            <button
                                key={c.categoryId}
                                onClick={() => setSelectedCategory(c)}
                                className={`px-4 py-1.5 rounded-full border text-sm font-medium transition ${selectedCategory?.categoryId === c.categoryId
                                    ? "bg-orange-500 text-white border-orange-500"
                                    : "bg-white border-gray-300 hover:border-orange-400 hover:text-orange-500"
                                    }`}
                            >
                                {c.categoryName}
                            </button>
                        ))}
                    </div>
                )}

                {/* Ô search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
                    {products.length > 0 ? (
                        products.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => onSelect(item)}
                                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-orange-50 cursor-pointer transition border border-transparent hover:border-orange-300"
                            >
                                <img
                                    src={item.noBgImgUrl}
                                    alt={item.productName}
                                    className="w-32 h-32 rounded-lg object-cover"
                                />
                                <div className="text-center">
                                    <p className="font-medium text-gray-800 text-sm">
                                        {item.productName}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="col-span-3 text-center text-gray-500 py-6">
                            Không tìm thấy sản phẩm nào
                        </p>
                    )}
                </div>

                {/* Footer buttons */}
                <div className="flex justify-end mt-6 gap-3">
                    <button
                        onClick={() => {
                            onReset();
                            onClose();
                        }}
                        className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 hover:border-gray-400 transition-colors"
                    >
                        Reset
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors"
                    >
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
}
