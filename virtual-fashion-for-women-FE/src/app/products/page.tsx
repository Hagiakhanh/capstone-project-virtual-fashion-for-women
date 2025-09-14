import { ApiGetProducts } from "@/api/product/ProductAPI";
import ProductCard from "@/components/Product/ProductCard";
import { Spin } from "antd";
import React from "react";

type Product = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
};

export default async function ProductsListPage() {
  // Gọi API trực tiếp từ server
  const products: Product[] = await ApiGetProducts(1, 10); // giả sử ApiGetProducts nhận pageIndex & pageSize

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Danh sách sản phẩm</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products?.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
