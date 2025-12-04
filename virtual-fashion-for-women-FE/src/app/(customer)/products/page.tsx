"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Select } from "antd";
import { ArrowDownWideNarrow } from "lucide-react";
import { api } from "@/api/instance";
import { Pagination } from "antd";
import ProductItemHome from "@/components/Product/ProductItemHome";

export default function ShowAllProductsPage() {
   const params = useSearchParams();
   const category = params.get("category") || "";
   const [sortValue, setSortValue] = useState("2");
   const [searchResults, setSearchResults] = useState<any[]>([]);
   const [loadingAddToCart, setLoadingAddToCart] = useState<boolean>(false);
   const [pagination, setPagination] = useState({
      pageIndex: 1,
      pageSize: 12,
      total: undefined
   });

   const fetchSearchResults = async () => {
      const response = await api.get('/product/search', {
         params: {
            PageIndex: pagination.pageIndex,
            PageSize: pagination.pageSize,
            ProductSort: parseInt(sortValue),
            CategoryName: category
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
   }, [sortValue, category]);

   return (
      <div className="w-full lg:w-[75%] mx-auto min-h-screen px-4 sm:px-6 md:px-10 lg:px-20 py-6 md:py-10">
         <h2 className="text-base sm:text-lg md:text-xl font-semibold line-clamp-2 sm:line-clamp-1">
            Danh mục sản phẩm:{" "}
            <span className="text-[#e66400]">{category ? category : "Tất cả"}</span>
         </h2>

         <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mt-4 sm:mt-6 mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3">
               <ArrowDownWideNarrow className="w-5 h-5 sm:w-6 sm:h-6" />
               <span className="text-base sm:text-lg">Sắp xếp theo</span>
            </div>

            <Select
               value={sortValue}
               onChange={(e) => setSortValue(e)}
               className="w-full sm:w-[150px]"
               options={[
                  { value: "2", label: "Hàng mới" },
                  { value: "3", label: "Bán chạy nhất" },
                  { value: "4", label: "Đang giảm giá" },
               ]}
            />
         </div>

         <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-10">
            {
               searchResults?.map((product) => (
                  <ProductItemHome onWishlistSuccess={handleProductChange} product={product} key={product.productId} setLoading={setLoadingAddToCart} />
               ))
            }
         </div>

      </div>
   )
}