"use client";

import { useState, useEffect } from "react";
import { Category } from "@/types/category";
import { Size } from "@/types/size";
import {
    RequestCreateCategoryTemplatesModel,
    TemplateDetailsModel,
} from "@/models/RequestCreateCategoryTemplatesModel"; // <-- Bạn cần định nghĩa type này
import { api } from "@/api/instance";
import { messageToast } from "@/helpers/toastHelper";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
    category: Category | null;
    allSizes: Size[];
}

// Hàm trợ giúp để tạo một hàng template rỗng
const createEmptyTemplate = (sizeId: number): TemplateDetailsModel => ({
    sizeId: sizeId,
    minShoulder: null, maxShoulder: null,
    minBust: null, maxBust: null,
    minWaist: null, maxWaist: null,
    minHips: null, maxHips: null,
});

export default function CategorySizeTemplateModal({
    isOpen,
    onClose,
    onSaveSuccess,
    category,
    allSizes,
}: Props) {
    const [templates, setTemplates] = useState<TemplateDetailsModel[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Xác định các cột cần hiển thị dựa trên bodyPart
    const bodyPart = category?.bodyPart;
    const showShoulder = bodyPart === "Thân trên";
    const showBust = bodyPart === "Thân trên" || bodyPart === "Toàn thân";
    const showWaist = bodyPart === "Thân trên" || bodyPart === "Toàn thân" || bodyPart === "Thân dưới";
    const showHips = bodyPart === "Toàn thân" || bodyPart === "Thân dưới";
    
    // Lấy tên size từ master data
    const getSizeName = (sizeId: number) => {
        return allSizes.find(s => s.sizeId === sizeId)?.sizeCode || 'N/A';
    }

    // Fetch dữ liệu khi modal mở
    useEffect(() => {
        if (!isOpen || !category) {
            setTemplates([]); // Reset state khi đóng
            setIsEditing(false);
            return;
        }

        const fetchTemplateData = async () => {
            setIsLoading(true);
            try {
                // [GIẢ ĐỊNH] Bạn cần tạo route handler GET này
                const response = await api.get(
                    `categorysizetemplate/by-categoryid/${category.categoryId}`
                );
                
                const existingTemplates: TemplateDetailsModel[] = response.data;

                if (existingTemplates && existingTemplates.length > 0) {
                    // Đã có dữ liệu -> Chế độ Edit
                    setIsEditing(true);
                    // Map dữ liệu từ DB với master data `allSizes`
                    const templateMap = new Map(existingTemplates.map(t => [t.sizeId, t]));
                    const fullTemplateList = allSizes.map(size => 
                        templateMap.get(size.sizeId) || createEmptyTemplate(size.sizeId)
                    );
                    setTemplates(fullTemplateList);
                } else {
                    // Chưa có dữ liệu -> Chế độ Create
                    setIsEditing(false);
                    const emptyTemplates = allSizes.map(size => createEmptyTemplate(size.sizeId));
                    setTemplates(emptyTemplates);
                }
            } catch (error: any) {
                // Xử lý lỗi 404 (chưa có template) -> coi như tạo mới
                if (error.response?.status === 404) {
                    setIsEditing(false);
                    const emptyTemplates = allSizes.map(size => createEmptyTemplate(size.sizeId));
                    setTemplates(emptyTemplates);
                } else {
                    messageToast.error("Lỗi khi tải bảng size: " + error.message);
                    onClose(); // Đóng modal nếu lỗi nặng
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchTemplateData();
    }, [isOpen, category, allSizes, onClose]);

    // Xử lý khi input thay đổi
    // Đặt một hằng số cho giá trị tối đa
    const MAX_MEASUREMENT = 200;
    // Đặt hằng số cho số chữ số thập phân (ví dụ: 1)
    const MAX_DECIMALS = 1;

    const handleInputChange = (
    sizeId: number,
    field: keyof TemplateDetailsModel,
    value: string
    ) => {
        // 1. Xử lý trường hợp chuỗi rỗng (người dùng xóa hết số)
        if (value === "") {
            setTemplates((prevTemplates) =>
            prevTemplates.map((template) =>
                template.sizeId === sizeId
                ? { ...template, [field]: null } // Cập nhật state về null
                : template
            )
            );
            return; // Dừng lại
        }

        // 2. Kiểm tra định dạng (chặn các ký tự "e", "+", "-" ngay lập tức)
        //    (Mặc dù onKeyDown đã chặn, nhưng đây là chốt chặn nếu người dùng paste)
        if (value.includes("e") || value.includes("+") || value.includes("-")) {
            return; // Không làm gì cả
        }
        
        // 3. Kiểm tra số chữ số thập phân
        const parts = value.split(".");
        if (parts[1] && parts[1].length > MAX_DECIMALS) {
            return; // Không cập nhật state nếu nhập quá nhiều số thập phân (ví dụ: 12.34)
        }

        // 4. Chuyển đổi và kiểm tra giá trị
        const numericValue = parseFloat(value);

        // 5. Kiểm tra nếu là số hợp lệ (ví dụ: người dùng gõ "12." thì numericValue là 12)
        if (!isNaN(numericValue)) {
            
            // 6. KIỂM TRA QUAN TRỌNG: Giá trị có vượt quá giới hạn không
            if (numericValue > MAX_MEASUREMENT) {
                return; // Không cập nhật state nếu số quá lớn (ví dụ: 9999)
            }

            // 7. Nếu mọi thứ OK, cập nhật state
            setTemplates((prevTemplates) =>
            prevTemplates.map((template) =>
                template.sizeId === sizeId
                ? { ...template, [field]: numericValue }
                : template
            )
            );
        }
    };

    // Xử lý Lưu
    const handleSave = async () => {
        if (!category) return;
        setIsSaving(true);

        // Lọc ra những size có ít nhất 1 giá trị được nhập
        // Hoặc bạn có thể gửi tất cả (kể cả null) tùy vào logic backend
        const validTemplates = templates.filter(t => 
            t.minShoulder != null || t.maxShoulder != null ||
            t.minBust != null || t.maxBust != null ||
            t.minWaist != null || t.maxWaist != null ||
            t.minHips != null || t.maxHips != null
        );

        const cleanTemplates = validTemplates.map((t) => ({
            sizeId: t.sizeId,
            minShoulder: t.minShoulder,
            maxShoulder: t.maxShoulder,
            minBust: t.minBust,
            maxBust: t.maxBust,
            minWaist: t.minWaist,
            maxWaist: t.maxWaist,
            minHips: t.minHips,
            maxHips: t.maxHips,
        }));

        try {
            let response;
            if (isEditing) {
                const updatePayload = {
                    templates: cleanTemplates,
                };
                response = await api.put(
                    `/categorysizetemplate/${category.categoryId}`, // <-- Đã sửa 's'
                    updatePayload // <-- Gửi payload chỉ có templates
                );
            } else {
                const createPayload: RequestCreateCategoryTemplatesModel = {
                    categoryId: category.categoryId,
                    templates: validTemplates,
                };
                response = await api.post(
                    "/categorysizetemplate", // <-- Đã sửa 's'
                    createPayload // <-- Gửi payload đầy đủ
                );
            }
            
            if (response.status === 200 || response.status === 201) {
                onSaveSuccess();
            } else {
                throw new Error(response.data.message || "Lưu thất bại");
            }
        } catch (error: any) {
            const errMsg = error.response?.data?.message || error.message || "Lỗi không xác định";
            messageToast.error(errMsg);
            console.error("Error saving template:", error);
        } finally {
            setIsSaving(false);
        }
    };


    if (!isOpen) return null;

    return (
        // Backdrop
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 flex justify-center items-center">
        {/* Modal Content */}
            <div className="bg-white rounded-lg shadow-xl z-50 w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-5 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Chỉnh Bảng Số Đo cho: {category?.categoryName}
                    </h2>
                    <p className="text-sm text-gray-500">
                        Nhập số đo (cm) cho các khoảng Min - Max. Bỏ trống nếu size không áp dụng.
                    </p>
                </div>

                {/* Body (Form) */}
                <div className="p-5 overflow-auto">
                    {isLoading ? (
                        <p>Đang tải dữ liệu...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">Size</th>
                                        {showShoulder && <th colSpan={2} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Vai</th>}
                                        {showBust && <th colSpan={2} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ngực</th>}
                                        {showWaist && <th colSpan={2} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Eo</th>}
                                        {showHips && <th colSpan={2} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Mông</th>}
                                    </tr>
                                    <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 sticky left-0 bg-gray-50 z-10"></th>
                                        {showShoulder && <>
                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Min</th>
                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Max</th>
                                        </>}
                                        {showBust && <>
                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Min</th>
                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Max</th>
                                        </>}
                                        {showWaist && <>
                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Min</th>
                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Max</th>
                                        </>}
                                        {showHips && <>
                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Min</th>
                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Max</th>
                                        </>}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {templates.map((template) => (
                                        <tr key={template.sizeId}>
                                            <td className="px-3 py-3 whitespace-nowrap font-medium text-gray-900 sticky left-0 bg-white z-10">{getSizeName(template.sizeId)}</td>
                                            
                                            {/* --- VAI --- */}
                                            {showShoulder && <>
                                                <td>
                                                    <input 
                                                        type="number" 
                                                        min="0" 
                                                        max="99" 
                                                        step="1" 
                                                        value={template.minShoulder ?? ''} 
                                                        onKeyDown={(e) =>
                                                            ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                                                        } 
                                                        onChange={e => 
                                                            handleInputChange(template.sizeId, 'minShoulder', e.target.value)
                                                        } 
                                                        className="w-20 form-input rounded-md shadow-sm" 
                                                    />
                                                </td>
                                                <td>
                                                    <input 
                                                        type="number" 
                                                        min="0" 
                                                        max="99" 
                                                        step="1" 
                                                        value={template.maxShoulder ?? ''} 
                                                        onKeyDown={(e) =>
                                                            ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                                                        } 
                                                        onChange={e => handleInputChange(template.sizeId, 'maxShoulder', e.target.value)} 
                                                        className="w-20 form-input rounded-md shadow-sm" 
                                                    />
                                                </td>
                                            </>}
                                            {/* --- NGỰC --- */}
                                            {showBust && <>
                                                <td>
                                                    <input 
                                                        type="number" 
                                                        min="0" 
                                                        max='200'
                                                        step="1" 
                                                        value={template.minBust ?? ''} 
                                                        onKeyDown={(e) =>
                                                            ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                                                        } 
                                                        onChange={e => handleInputChange(template.sizeId, 'minBust', e.target.value)} 
                                                        className="w-20 form-input rounded-md shadow-sm" 
                                                    />
                                                </td>
                                                <td>
                                                    <input 
                                                        type="number" 
                                                        min="0" 
                                                        max='200'
                                                        step="1" 
                                                        value={template.maxBust ?? ''} 
                                                        onKeyDown={(e) =>
                                                            ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                                                        } 
                                                        onChange={e => handleInputChange(template.sizeId, 'maxBust', e.target.value)} 
                                                        className="w-20 form-input rounded-md shadow-sm" 
                                                    />
                                                </td>
                                            </>}
                                            {/* --- EO --- */}
                                            {showWaist && <>
                                                <td>
                                                    <input 
                                                        type="number" 
                                                        min="0" 
                                                        max='200'
                                                        step="1" 
                                                        value={template.minWaist ?? ''} 
                                                        onKeyDown={(e) =>
                                                            ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                                                        } 
                                                        onChange={e => handleInputChange(template.sizeId, 'minWaist', e.target.value)} 
                                                        className="w-20 form-input rounded-md shadow-sm" 
                                                    />
                                                </td>
                                                <td>
                                                    <input 
                                                        type="number" 
                                                        min="0" 
                                                        max='200'
                                                        step="1" 
                                                        value={template.maxWaist ?? ''} 
                                                        onKeyDown={(e) =>
                                                            ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                                                        } 
                                                        onChange={e => handleInputChange(template.sizeId, 'maxWaist', e.target.value)} 
                                                        className="w-20 form-input rounded-md shadow-sm" 
                                                    />
                                                </td>
                                            </>}
                                            {/* --- MÔNG --- */}
                                            {showHips && <>
                                                <td>
                                                    <input 
                                                        type="number" 
                                                        min="0" 
                                                        max='200'
                                                        step="1" 
                                                        value={template.minHips ?? ''} 
                                                        onKeyDown={(e) =>
                                                            ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                                                        }
                                                        onChange={e => handleInputChange(template.sizeId, 'minHips', e.target.value)} 
                                                        className="w-20 form-input rounded-md shadow-sm" 
                                                    />
                                                </td>
                                                <td>
                                                    <input 
                                                        type="number" 
                                                        min="0" 
                                                        max='200'
                                                        step="1" 
                                                        value={template.maxHips ?? ''} 
                                                        onKeyDown={(e) =>
                                                            ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                                                        }
                                                        onChange={e => handleInputChange(template.sizeId, 'maxHips', e.target.value)} 
                                                        className="w-20 form-input rounded-md shadow-sm" 
                                                    />
                                                </td>
                                            </>}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t bg-gray-50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 cursor-pointer disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? "Đang lưu..." : "Lưu Bảng Size"}
                    </button>
                </div>
            </div>
        </div>
    );
}