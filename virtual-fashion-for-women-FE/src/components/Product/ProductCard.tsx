"use client";

import React, { useState } from "react";

type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
};

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const [added, setAdded] = useState(false);

  const handleBuy = () => {
    setAdded(true);
    // TODO: gọi API add-to-cart nếu cần
  };

  return (
    <div className="border rounded-2xl shadow-sm hover:shadow-lg transition p-4 flex flex-col relative">
      {added && (
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
          Đã thêm
        </div>
      )}
      <img
        src={product.image}
        alt={product.title}
        className="h-40 w-full object-contain mb-4"
      />
      <h2 className="text-lg font-semibold">{product.title}</h2>
      <p className="text-gray-600 text-sm line-clamp-2 mb-2">
        {product.description}
      </p>
      <span className="text-sm text-blue-500">{product.category}</span>
      <div className="mt-auto flex justify-between items-center">
        <span className="text-red-500 font-bold">
          {product.price.toLocaleString("vi-VN")} ₫
        </span>
        <button
          onClick={handleBuy}
          className={`px-3 py-1 rounded-lg text-white ${
            added ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
          disabled={added}
        >
          {added ? "Đã thêm" : "Mua"}
        </button>
      </div>
    </div>
  );
}
