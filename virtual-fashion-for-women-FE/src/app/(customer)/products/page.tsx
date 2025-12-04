"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Select } from "antd";
import { ArrowDownWideNarrow } from "lucide-react";
import { api } from "@/api/instance";
import { Pagination } from "antd";
import ProductItemHome from "@/components/Product/ProductItemHome";
import { PaginationDTO } from "@/models/PaginationDTO";

export default function ShowAllProductsPage() {
   const params = useSearchParams();
   const category = params.get("category") || "";
   const [sortValue, setSortValue] = useState("2");
   const [searchResults, setSearchResults] = useState<any[]>([]);
   const [loadingAddToCart, setLoadingAddToCart] = useState<boolean>(false);
   const [pagination, setPagination] = useState<PaginationDTO>({
      CurrentPage: 1,
      HasNext: false,
      HasPrevious: false,
      PageSize: 12,
      TotalCount: 0,
      TotalPages: 0,
   });

   const fetchSearchResults = async () => {
      const response = await api.get('/product/search', {
         params: {
            PageIndex: pagination.CurrentPage,
            PageSize: pagination.PageSize,
            ProductSort: parseInt(sortValue),
            CategoryName: category
         }
      })

      if (response.status === 200) {
         setSearchResults(response.data?.data);
         setPagination((prev) => ({
            ...prev,
            ...response.data?.pagination
         }));
      } else {
         setSearchResults([]);
      }
   }

   const handleProductChange = () => {
      fetchSearchResults();
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

         <div className="flex justify-center items-center gap-3 mt-5">
            {/* Nút trước */}
            <button
               disabled={pagination.CurrentPage === 1}
               onClick={() => handlePageChange(pagination.CurrentPage - 1)}
               className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
               « Trước
            </button>

            {getPageNumbers(pagination.TotalPages, pagination.CurrentPage).map((page, idx) => (
               <button
                  key={idx}
                  onClick={() => typeof page === 'number' && handlePageChange(page)}
                  disabled={page === "..."}
                  className={`px-4 py-2 rounded-lg border transition-all ${pagination.CurrentPage === page
                     ? 'bg-black text-white border-black'
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
               className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
               Sau »
            </button>
         </div>

      </div>
   )
}