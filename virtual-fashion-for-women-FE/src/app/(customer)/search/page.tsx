"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Select } from "antd";
import { ArrowDownWideNarrow } from "lucide-react";
import { api } from "@/api/instance";
import { Pagination } from "antd";
import ProductItemHome from "@/components/Product/ProductItemHome";
import { PaginationDTO } from "@/models/PaginationDTO";

export default function SearchPage() {
   const params = useSearchParams();
   const keyword = params.get("keyword") || "";
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
            ProductName: keyword
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
   }, [keyword, sortValue, pagination.CurrentPage, pagination.PageSize]);

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