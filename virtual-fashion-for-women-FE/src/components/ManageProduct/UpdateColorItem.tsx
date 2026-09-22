import { useState, useEffect, useCallback } from 'react';
import { Trash2, Upload, Plus } from 'lucide-react';
import { Color, Size, UpdateProductColorFormData } from '@/models/RequestUpdateProduct';
import UpdateVariantItem from './UpdateVariantItem';
import ColorModal from './ColorModal'; // Sử dụng chung ColorModal
import Image from 'next/image'; // Import Image for preview
import { messageToast } from '@/helpers/toastHelper';

interface UpdateColorItemProps {
    productColor: UpdateProductColorFormData;
    colorIndex: number;
    colors: Color[];
    sizes: Size[];
    onUpdate: (field: string, value: any) => void;
    onRemove: () => void;
    onAddVariant: () => void;
    onRemoveVariant: (variantIndex: number) => void;
    onUpdateVariant: (variantIndex: number, field: string, value: any) => void;
    usedColorIds: number[];
    otherNewNames: string[];
    otherNewPrefixes: string[];
    otherNewHexCodes: string[];

    // Danh sách các màu ĐÃ TỒN TẠI (nên được lọc ở trang update, loại bỏ màu đang edit)
    existingNames: string[];
    existingPrefixes: string[];
    existingHexCodes: string[];
}

export default function UpdateColorItem({
    productColor,
    colorIndex,
    colors,
    sizes,
    onUpdate,
    onRemove,
    onAddVariant,
    onRemoveVariant,
    onUpdateVariant,
    usedColorIds,
    otherNewNames,
    otherNewPrefixes,
    otherNewHexCodes,
    existingNames,
    existingPrefixes,
    existingHexCodes,
}: UpdateColorItemProps) {
    const [isColorModalOpen, setIsColorModalOpen] = useState(false);
    // State cho preview ảnh (nếu là File)
    const [noBgPreviewUrl, setNoBgPreviewUrl] = useState<string | undefined>(productColor.noBgImgPreview);
    const [variantPreviews, setVariantPreviews] = useState<string[]>(productColor.productVariantImagePreviews || []);


    // Effect để mở modal cho màu mới hoàn toàn
    useEffect(() => {
        // Mở modal nếu đây là item mới được thêm (chưa có ID và chưa có tên)
        if (!productColor.productColorId && !productColor.colorId && !productColor.colorName) {
            setIsColorModalOpen(true);
        }
    }, [productColor.productColorId, productColor.colorId, productColor.colorName]); // Chạy khi các giá trị này thay đổi (hoặc khi component mount)

    // Effect để tạo/thu hồi URL cho ảnh File (ảnh mới upload)
    useEffect(() => {
        // Ảnh không nền
        let noBgUrl: string | undefined;
        if (productColor.noBgImgUrl instanceof File) {
            noBgUrl = URL.createObjectURL(productColor.noBgImgUrl);
            setNoBgPreviewUrl(noBgUrl);
        } else {
             setNoBgPreviewUrl(productColor.noBgImgPreview); // Use existing preview URL if not a file
        }

         // Ảnh biến thể (nhiều ảnh)
         const newUrls = (productColor.productVariantImages || [])
            .filter(file => file instanceof File) // Chỉ tạo URL cho File mới
            .map(file => URL.createObjectURL(file as File));

        // Kết hợp ảnh cũ (URL string) và ảnh mới (Object URL)
        const existingUrls = (productColor.productVariantImagePreviews || []).filter(url => typeof url === 'string');
        setVariantPreviews([...existingUrls, ...newUrls]);


        // Cleanup function
        return () => {
            if (noBgUrl) URL.revokeObjectURL(noBgUrl);
            newUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [productColor.noBgImgUrl, productColor.productVariantImages, productColor.noBgImgPreview, productColor.productVariantImagePreviews]);


    // === Handlers ===
    const handleNoBgImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpdate('noBgImgUrl', file); // Lưu File vào state cha
            // Preview sẽ tự cập nhật qua useEffect
        }
    };

    const handleVariantImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            // 1. Chỉ cập nhật danh sách File là các file vừa chọn
            onUpdate('productVariantImages', files); 
            // 2. (Quan trọng) Xóa danh sách preview ảnh cũ (ảnh từ server)
            onUpdate('productVariantImagePreviews', []);
        }
    };

    const handleColorSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === "") { // Chọn "-- Tạo màu mới --"
            // Reset colorId và mở modal
            onUpdate('colorId', undefined);
            // Xóa thông tin màu mới cũ (nếu có) để modal trống
            onUpdate('colorName', '');
            onUpdate('colorPrefix', '');
            onUpdate('hexCode', '#RGBRGB');
            setIsColorModalOpen(true);
        } else { // Chọn màu có sẵn
            const selectedColorId = parseInt(value);
            const selectedColor = colors.find(c => c.colorId === selectedColorId);
            onUpdate('colorId', selectedColorId);
            // Cập nhật luôn thông tin màu tương ứng (nếu cần hiển thị)
            if (selectedColor) {
                onUpdate('colorName', selectedColor.colorName);
                onUpdate('colorPrefix', selectedColor.colorPrefix);
                onUpdate('hexCode', selectedColor.hexCode);
            }
             // Đảm bảo modal đóng lại
             setIsColorModalOpen(false);
        }
    };

    // Hàm này được gọi khi modal ở mode="update" nhấn Save
    // Nó cập nhật lại các trường colorName, colorPrefix, hexCode cho item màu hiện tại
    const handleSaveNewColorInfo = (newData: { colorName: string; colorPrefix: string; hexCode: string }) => {
        onUpdate('colorName', newData.colorName);
        onUpdate('colorPrefix', newData.colorPrefix);
        onUpdate('hexCode', newData.hexCode);
        onUpdate('colorId', undefined); // Đảm bảo colorId là undefined vì đây là màu mới
        setIsColorModalOpen(false);
    };

    // Lấy dữ liệu ban đầu cho modal khi bấm nút "Chỉnh sửa" màu mới
    const getInitialModalData = () => ({
        colorName: productColor.colorName,
        colorPrefix: productColor.colorPrefix,
        hexCode: productColor.hexCode,
    });

    const isNewColor = !productColor.colorId; // Check if this item represents a new color

    const usedSizeIds = productColor.variants
        ?.map(v => v.sizeId)
        .filter(id => id !== undefined && id !== 0) as number[] || []; // Handle potentially undefined variants

    // 1. Tạo các hàm validation ổn định
    const getNameError = useCallback((name: string): string => {
        const nameLower = (name || "").toLowerCase();
        if (!nameLower) return "";
        if (otherNewNames.includes(nameLower)) return "Tên màu này đã được dùng cho một màu mới khác.";
        if (existingNames.includes(nameLower)) return "Tên màu này đã tồn tại trong hệ thống.";
        return "";
    }, [otherNewNames, existingNames]);

    const getPrefixError = useCallback((prefix: string): string => {
        const prefixLower = (prefix || "").toLowerCase();
        if (!prefixLower) return "";
        if (otherNewPrefixes.includes(prefixLower)) return "Mã prefix này đã được dùng cho một màu mới khác.";
        if (existingPrefixes.includes(prefixLower)) return "Mã prefix này đã tồn tại trong hệ thống.";
        return "";
    }, [otherNewPrefixes, existingPrefixes]);

    const getHexError = useCallback((hex: string): string => {
        const hexLower = (hex || "").toLowerCase();
        if (!hexLower || hexLower.length < 7) return "";
        if (otherNewHexCodes.includes(hexLower)) return "Mã hex này đã được dùng cho một màu mới khác.";
        if (existingHexCodes.includes(hexLower)) return "Mã hex này đã tồn tại trong hệ thống.";
        return "";
    }, [otherNewHexCodes, existingHexCodes]);

    // 2. Tính toán trạng thái lỗi và hợp lệ của modal
    const nameError = getNameError(productColor.colorName || "");
    const prefixError = getPrefixError(productColor.colorPrefix || "");
    const hexError = getHexError(productColor.hexCode || "");
    const isModalFormValid =
        !!productColor.colorName &&
        !!productColor.colorPrefix &&
        productColor.hexCode?.length === 7 &&
        !nameError &&
        !prefixError &&
        !hexError;

    // 3. Tạo các hàm handler để truyền xuống modal
    const handleModalNameChange = (value: string) => onUpdate("colorName", value);
    const handleModalPrefixChange = (value: string) => onUpdate("colorPrefix", value.toUpperCase());
    const handleModalHexChange = (value: string) => onUpdate("hexCode", value.toUpperCase());

    const handleModalConfirm = () => {
        if (!isModalFormValid) {
            //alert("Vui lòng điền đầy đủ thông tin và sửa các lỗi (nếu có).");
            messageToast.error("Vui lòng điền đầy đủ thông tin và sửa các lỗi (nếu có).");
            return;
        }
        setIsColorModalOpen(false);
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-semibold text-gray-700">Màu {colorIndex + 1}</h3>
                {/* <button type="button" onClick={onRemove} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 cursor-pointer">
                    <Trash2 size={18} />
                </button> */}
            </div>

            <div className="space-y-4">
                {/* Color Selection / New Color Info */}
                <div className="flex items-start gap-4">
                    {/* Select Dropdown */}
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Chọn màu *</label>
                        <select
                            value={productColor.colorId || ''} // Dùng '' nếu là màu mới
                            onChange={handleColorSelectChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                        >
                            <option value="">-- Tạo màu mới --</option>
                            {colors.map((c) => {
                                const isUsedByAnother = usedColorIds.includes(c.colorId) && c.colorId !== productColor.colorId;
                                return (
                                    <option
                                        key={c.colorId}
                                        value={c.colorId}
                                        disabled={isUsedByAnother}
                                        className={isUsedByAnother ? "text-gray-400 bg-gray-100" : ""}
                                    >
                                        {c.colorName} ({c.colorPrefix})
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* New Color Info Box (chỉ hiện khi đang tạo màu mới) */}
                    {isNewColor && (
                        <div className="flex-1 p-3 border border-dashed border-blue-400 rounded-md bg-blue-50 text-xs">
                            <p className="text-gray-700 mb-1.5">
                                {productColor.colorName ? "Thông tin màu mới:" : "Chưa có thông tin màu mới."}
                            </p>
                            {productColor.colorName && (
                                <div className="space-y-0.5 mb-2 font-medium text-blue-800">
                                    <p>Tên: {productColor.colorName}</p>
                                    <p>Mã: {productColor.colorPrefix}</p>
                                    <p>Hex: {productColor.hexCode}</p>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsColorModalOpen(true)}
                                className="w-full px-2 py-1.5 bg-white border border-blue-500 text-blue-600 font-medium rounded-md hover:bg-blue-50 text-xs cursor-pointer"
                            >
                                {productColor.colorName ? 'Chỉnh sửa' : 'Thêm thông tin'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Lens ID */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Lens ID (tùy chọn)</label>
                    <input
                        type="text"
                        value={productColor.lensId || ''}
                        onChange={(e) => onUpdate('lensId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Nhập Lens ID (nếu có)"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">PackageLens (tùy chọn)</label>
                    <input
                        type="text"
                        value={productColor.packageLens || ''}
                        onChange={(e) => onUpdate('packageLens', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Nhập PackageLens (nếu có)"
                    />
                    {/* Gợi ý validation tại UI */}
                    {productColor.lensId && !productColor.packageLens && (
                        <p className="text-xs text-red-500 mt-1">
                            Bạn phải nhập PackageLens vì đã nhập LensID.
                        </p>
                    )}
                </div>

                {/* Ảnh không nền */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Ảnh không nền (tùy chọn)</label>
                    <div className="flex items-center gap-3">
                        {noBgPreviewUrl ? (
                        <Image
                            src={noBgPreviewUrl}
                            alt="Ảnh không nền"
                            width={96} // size preview nhỏ hơn
                            height={96}
                            className="object-cover rounded border bg-gray-100"
                        />
                        ) : (
                        <div className="w-16 h-16 flex items-center justify-center border border-dashed rounded text-gray-400 text-xs bg-white">
                            No Img
                        </div>
                        )}
                        <label className="text-xs px-2 py-1 bg-white text-blue-600 rounded-md cursor-pointer hover:bg-gray-50 border border-blue-500 font-medium">
                            {noBgPreviewUrl ? 'Đổi ảnh' : 'Chọn ảnh'}
                            <input type="file" accept="image/*" onChange={handleNoBgImageChange} className="hidden" />
                        </label>
                    </div>
                 </div>

                {/* Ảnh biến thể (nhiều ảnh) */}
                <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Ảnh SP theo màu (nhiều ảnh)</label>
                    {variantPreviews && variantPreviews.length > 0 && (
                    <div className="flex gap-2 mb-2 flex-wrap p-2 rounded-lg bg-white border max-h-32 overflow-y-auto">
                        {variantPreviews.map((url, idx) => (
                            <Image
                                key={idx}
                                src={url}
                                alt={`Variant ${idx}`}
                                width={56} // size preview nhỏ
                                height={56}
                                className="object-cover rounded border shrink-0"
                            />
                        ))}
                    </div>
                    )}
                    <label className="text-xs px-2 py-1 bg-white text-blue-600 rounded-md cursor-pointer hover:bg-gray-50 border border-blue-500 font-medium">
                        <Upload size={14} className="inline mr-1" />
                            Thêm ảnh
                        <input type="file" accept="image/*" multiple onChange={handleVariantImagesChange} className="hidden" />
                    </label>
                 </div>


                {/* Variants Section */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-semibold text-gray-700">Biến thể theo Size</h4>
                        <button
                            type="button"
                            onClick={onAddVariant}
                            className="flex items-center gap-1 px-2 py-1 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 text-xs font-medium cursor-pointer"
                        >
                            <Plus size={14} />
                            Thêm size
                        </button>
                    </div>
                    {productColor.variants?.length === 0 && (
                        <p className="text-xs text-gray-500 text-center py-2">Chưa có size nào cho màu này.</p>
                    )}
                    {productColor.variants?.map((variant, variantIndex) => (
                        <UpdateVariantItem
                            key={variant.productVariantId || `new-variant-${variantIndex}`} // Key ổn định
                            variant={variant}
                            variantIndex={variantIndex}
                            sizes={sizes}
                            onUpdate={(field, value) => onUpdateVariant(variantIndex, field, value)}
                            onRemove={() => onRemoveVariant(variantIndex)}
                            usedSizeIds={usedSizeIds} // Pass down used size IDs
                        />
                    ))}
                </div>
            </div>

            {/* Modal for creating/editing NEW color info */}
            {isNewColor && ( // Chỉ render modal nếu đây là item màu mới
                 <ColorModal
                    isOpen={isColorModalOpen}
                    onClose={() => setIsColorModalOpen(false)}
                    mode="update" // Dùng mode update vì ta muốn modal tự quản lý state và gọi onSave
                    colorData={getInitialModalData()} // Truyền dữ liệu hiện tại (có thể trống)
                    onNameChange={handleModalNameChange}
                    onPrefixChange={handleModalPrefixChange}
                    onHexChange={handleModalHexChange}
                    onConfirm={handleModalConfirm}
                    // Truyền lỗi và trạng thái hợp lệ
                    nameError={nameError}
                    prefixError={prefixError}
                    hexError={hexError}
                    isFormValid={isModalFormValid}
                 />
            )}
        </div>
    );
}