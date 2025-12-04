'use client';

import { api } from "@/api/instance";
import { Modal } from "antd";
import { useEffect, useState } from "react";

const SizeGuideModal = ({ isOpen, onClose, categoryId }: any) => {
   const [sizeTable, setSizeTable] = useState<any[]>([]);

   const fetchSizeTable = async (categoryId: number) => {
      try {
         const response = await api.get(`/categorysizetemplate/notfullmodel/${categoryId}`);
         console.log("Size Table Response:", response);  
         setSizeTable(response.data);
      } catch (error) {
         console.error("Error fetching size table:", error);
      }
   };

   console.log("Size Table:", sizeTable);

   // 1. Logic cột cần hiển thị
   const bodyPart = sizeTable[0]?.bodyPart;
   const showShoulder = bodyPart === "Thân trên";
   const showBust = bodyPart === "Thân trên" || bodyPart === "Toàn thân";
   const showWaist = bodyPart === "Thân trên" || bodyPart === "Toàn thân" || bodyPart === "Thân dưới";
   const showHips = bodyPart === "Toàn thân" || bodyPart === "Thân dưới";

   // Hàm format hiển thị khoảng (Min - Max)
   const formatRange = (min?: number | null, max?: number | null) => {
      if (min != null && max != null) return `${min} - ${max}`;
      if (min != null) return `> ${min}`;
      if (max != null) return `< ${max}`;
      return "-";
   };

   useEffect(() => {
      fetchSizeTable(categoryId);
   }, [categoryId]);

   return (
      <Modal
         title={<div className="text-xl font-bold text-center">Bảng Quy Đổi Kích Cỡ</div>}
         open={isOpen}
         onCancel={onClose}
         footer={null}
         width={700}
         centered
      >
         <div className="py-4">
            <p className="text-gray-500 text-center mb-4 italic">
               Đơn vị tính: Centimeters (cm). Hãy đo cơ thể bạn và đối chiếu bảng dưới đây.
            </p>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
               <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                     <tr>
                        <th className="px-4 py-3 text-left text-sm font-bold text-gray-700 uppercase">Size</th>
                        {showShoulder && <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 uppercase">Vai</th>}
                        {showBust && <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 uppercase">Ngực</th>}
                        {showWaist && <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 uppercase">Eo</th>}
                        {showHips && <th className="px-4 py-3 text-center text-sm font-bold text-gray-700 uppercase">Mông</th>}
                     </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                     {sizeTable.map((row) => (
                        <tr key={row.sizeId} className="hover:bg-gray-50 transition-colors">
                           <td className="px-4 py-3 text-sm font-bold text-gray-900 bg-gray-50/50">
                              {row.sizeCode}
                           </td>

                           {showShoulder && (
                              <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                 {formatRange(row.minShoulder, row.maxShoulder)}
                              </td>
                           )}

                           {showBust && (
                              <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                 {formatRange(row.minBust, row.maxBust)}
                              </td>
                           )}

                           {showWaist && (
                              <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                 {formatRange(row.minWaist, row.maxWaist)}
                              </td>
                           )}

                           {showHips && (
                              <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                 {formatRange(row.minHips, row.maxHips)}
                              </td>
                           )}
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </Modal>
   );
};

export default SizeGuideModal;