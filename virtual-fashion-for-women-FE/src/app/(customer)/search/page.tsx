"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Select } from "antd";
import { ArrowDownWideNarrow } from "lucide-react";
import { api } from "@/api/instance";
import { Pagination } from "antd";
import ProductItemHome from "@/components/Product/ProductItemHome";

export default function SearchPage() {
   const params = useSearchParams();
   const keyword = params.get("keyword") || "";
   const [sortValue, setSortValue] = useState("2");
   const [searchResults, setSearchResults] = useState<any[]>([]);
   const [loadingAddToCart, setLoadingAddToCart] = useState<boolean>(false);
   const [pagination, setPagination] = useState({
      pageIndex: 1,
      pageSize: 5,
      total: undefined
   });

   const fetchSearchResults = async () => {
      const response = await api.get('/product/search', {
         params: {
            PageIndex: pagination.pageIndex,
            PageSize: 12,
            ProductSort: parseInt(sortValue),
            ProductName: keyword
         }
      })

      if (response.status === 200) {
         setSearchResults(response?.data);
      } else {
         setSearchResults([]);
      }
   }

   const handleProductChange = () => {
      fetchSearchResults();
   };

   useEffect(() => {
      fetchSearchResults();
   }, [keyword, sortValue]);

   return (
      <div className="w-[75%] mx-auto min-h-screen px-3 md:px-20 py-10">
         <h2 className="text-xl font-semibold line-clamp-1">
            Kết quả tìm kiếm cho từ khoá:{" "}
            <span className="text-[#e66400]">{keyword}</span>
         </h2>

         <div className="flex items-center gap-3 mt-6 mb-8">
            <ArrowDownWideNarrow />
            <span className="text-lg">Sắp xếp theo</span>

            <Select
               value={sortValue}
               onChange={(e) => setSortValue(e)}
               style={{ width: 150 }}
               options={[
                  { value: "2", label: "Hàng mới" },
                  { value: "3", label: "Bán chạy nhất" },
                  { value: "4", label: "Đang giảm giá" },
               ]}
            />
         </div>

         <div className="grid grid-cols-4 gap-10">
            {
               searchResults?.map((product) => (
                  <ProductItemHome onWishlistSuccess={handleProductChange} product={product} key={product.productId} setLoading={setLoadingAddToCart} />
               ))
            }
         </div>

      </div>
   )
}