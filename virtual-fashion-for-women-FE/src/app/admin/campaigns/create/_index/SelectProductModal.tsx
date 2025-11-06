'use client';
import React, { useEffect, useState } from "react";
import { X, Search } from "lucide-react";
import { api, apiToken } from "@/api/instance";
import { message, Spin, Pagination, Tooltip } from "antd";

interface ProductItem {
  productId: string;
  productName: string;
  price: number;
  mainImageUrl: string;
  isValid: boolean;
}

interface CategoryItem {
  categoryId: string;
  categoryName: string;
}

export default function SelectProductModal({
  onClose,
  onSelect,
  campaignDate,
  selectedProducts = [], // ✅ thêm props này
}: {
  onClose: () => void;
  onSelect: (product: ProductItem) => void;
  campaignDate: { start: string | undefined; end: string | undefined };
  selectedProducts?: string[]; // ✅ list ProductID đã chọn
}) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(8);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/category");
        if (res.status === 200) setCategories(res.data || []);
      } catch {
        message.error("Không thể tải danh mục sản phẩm");
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        pageIndex: pageIndex.toString(),
        pageSize: pageSize.toString(),
        status: "active",
      });
      if (selectedCategory !== "all")
        queryParams.append("categoryId", selectedCategory);
      if (search.trim()) queryParams.append("searchTerm", search.trim());

      const res = await api.get(`/product?${queryParams.toString()}`);
      if (res.status !== 200) throw new Error("Không thể tải danh sách sản phẩm");
      
      const allProducts: ProductItem[] = res.data.data.map((p: any) => ({
        productId: p.productId,
        productName: p.productName,
        price: p.price,
        mainImageUrl: p.mainImageUrl,
        isValid: true,
      }));

      setTotal(res.data.totalCount || allProducts.length);

      // ✅ Kiểm tra hợp lệ qua API validate
      const checkRes = await apiToken.post(`/productInSaleCampaign/validate`, {
        startDate: campaignDate.start,
        endDate: campaignDate.end,
        listProductID: allProducts.map((p) => p.productId),
      });

      if (checkRes.status === 200 && checkRes.data?.data) {
        const validList = checkRes.data.data.validProductIDList || [];
        allProducts.forEach((p) => {
          p.isValid = validList.includes(p.productId);
        });
      }

      setProducts(allProducts);
    } catch (err: any) {
      console.error(err);
      message.error(err.message || "Lỗi khi tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [pageIndex, selectedCategory, search, campaignDate]);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl w-full max-w-5xl shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={22} />
        </button>

        <h2 className="text-2xl font-semibold mb-5 text-center">
          Chọn sản phẩm áp dụng
        </h2>

        {/* Danh mục */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => {
              setSelectedCategory("all");
              setPageIndex(1);
            }}
            className={`px-3 py-1 rounded-full border text-sm ${
              selectedCategory === "all"
                ? "bg-orange-500 text-white border-orange-500"
                : "border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            Tất cả
          </button>
          {categories.map((c) => (
            <button
              key={c.categoryId}
              onClick={() => {
                setSelectedCategory(c.categoryId);
                setPageIndex(1);
              }}
              className={`px-3 py-1 rounded-full border text-sm ${
                selectedCategory === c.categoryId
                  ? "bg-orange-500 text-white border-orange-500"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {c.categoryName}
            </button>
          ))}
        </div>

        {/* Tìm kiếm */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageIndex(1);
            }}
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Danh sách sản phẩm */}
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <Spin />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[480px] overflow-y-auto">
              {products.map((item) => {
                const alreadySelected = selectedProducts.includes(item.productId);
                const disabled = !item.isValid || alreadySelected;
                const reason = !item.isValid
                  ? "Sản phẩm này đã thuộc chiến dịch khác"
                  : alreadySelected
                  ? "Sản phẩm này đã được chọn"
                  : "";

                return (
                  <Tooltip key={item.productId} title={reason} placement="top">
                    <div
                      onClick={() => {
                        if (!disabled) onSelect(item);
                      }}
                      className={`border rounded-lg p-3 flex flex-col items-center transition
                        ${
                          disabled
                            ? "cursor-not-allowed bg-gray-100 border-gray-300 opacity-60"
                            : "cursor-pointer hover:bg-orange-50 hover:border-orange-400"
                        }`}
                    >
                      <img
                        src={item.mainImageUrl}
                        alt={item.productName}
                        className="w-28 h-28 object-cover rounded-lg mb-2"
                      />
                      <p className="font-medium text-center text-gray-700 text-sm line-clamp-2 text-ellipsis">
                        {item.productName}
                      </p>

                      {disabled ? (
                        <span className="text-xs text-red-500 mt-1 font-medium">
                          {reason}
                        </span>
                      ) : (
                        <p className="text-orange-500 font-semibold text-xs mt-1">
                          {item.price.toLocaleString()} ₫
                        </p>
                      )}
                    </div>
                  </Tooltip>
                );
              })}
            </div>

            <div className="flex justify-center mt-4">
              <Pagination
                current={pageIndex}
                pageSize={pageSize}
                total={total}
                onChange={(page) => setPageIndex(page)}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
