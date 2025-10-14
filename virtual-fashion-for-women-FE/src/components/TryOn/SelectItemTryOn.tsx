'use client';
import React, { useState, useMemo } from "react";
import { X, Search } from "lucide-react";
import { Category } from "@/models/RequestCreateProduct";

export default function TopSelectModal({
    searchKeyword,
    category = [],
    onClose,
    onSelect,
    onReset,
}: {
    searchKeyword?: string;
    category?: Category[];
    onClose: () => void;
    onSelect: (item: { image: string; name: string; price: string }) => void;
    onReset: () => void;
}) {
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        category[0]?.categoryId || null
    );
    const [searchText, setSearchText] = useState(searchKeyword || "");

    const products = [
        { image: "/shirt1.jpg", name: "Áo sơ mi trắng nữ", price: "300.000 VND" },
        { image: "/shirt2.jpg", name: "Áo sơ mi công sở", price: "350.000 VND" },
        { image: "/shirt3.jpg", name: "Áo thun nữ basic", price: "250.000 VND" },
        { image: "/shirt4.jpg", name: "Áo khoác blazer", price: "500.000 VND" },
        { image: "/shirt5.jpg", name: "Áo dài tay công sở", price: "400.000 VND" },
    ];

    // Lọc sản phẩm theo từ khóa tìm kiếm
    const filteredProducts = useMemo(() => {
        return products.filter((item) =>
            item.name.toLowerCase().includes(searchText.toLowerCase())
        );
    }, [searchText, products]);

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
                                onClick={() => setSelectedCategory(c.categoryId)}
                                className={`px-4 py-1.5 rounded-full border text-sm font-medium transition ${selectedCategory === c.categoryId
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

                {/* Danh sách sản phẩm */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((item, index) => (
                            <div
                                key={index}
                                onClick={() => onSelect(item)}
                                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-orange-50 cursor-pointer transition border border-transparent hover:border-orange-300"
                            >
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-32 h-32 rounded-lg object-cover"
                                />
                                <div className="text-center">
                                    <p className="font-medium text-gray-800 text-sm">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-gray-500">{item.price}</p>
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
                        onClick={onReset}
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
