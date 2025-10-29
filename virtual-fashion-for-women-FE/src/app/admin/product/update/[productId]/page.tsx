'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Product,
    Category,
    Color,
    Size,
    Tag,
    TagDto,
    ProductColor,
    ProductVariant,
    UpdateProductColorFormData,
} from '@/models/RequestUpdateProduct';
import { api } from '@/api/instance';
import { convertUpdateToFormData } from '@/utils/productHelpers';
import LoadingSpinner from '@/components/ManageProduct/LoadingSpinner';
import UpdateColorSection from '@/components/ManageProduct/UpdateColorSection';
import UpdateTagsSection from '@/components/ManageProduct/UpdateTagsSection';
import { Upload } from 'lucide-react';
import { messageToast } from '@/helpers/toastHelper';

interface UpdateProductPageProps {
    params: { productId: string };
}

export default function UpdateProductPage({ params }: UpdateProductPageProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // ... (All other state variables remain the same)
    const [product, setProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const [sizes, setSizes] = useState<Size[]>([]);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState('');
    const [productColors, setProductColors] = useState<UpdateProductColorFormData[]>([]);
    const [selectedTags, setSelectedTags] = useState<TagDto[]>([]);


    // ... (useEffect, fetchData, updateBasicField, handleUpdateTags, add/remove/update handlers remain the same)
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const productRes = await api.get(`/product/id/${params.productId}`);
            const productData = productRes.data;

            if (productData && productData.productId) {
                const prod = productData;
                setProduct(prod);
                setProductName(prod.productName || '');
                setDescription(prod.description || '');
                setPrice(prod.price || '');
                setCategoryId(prod.categoryId || '');
                setMainImagePreview(prod.mainImageUrl || '');

                if (prod.tags && prod.tags.length > 0) {
                    const mappedTags = prod.tags.map((tag: Tag) => ({
                        tagId: tag.tagId,
                        tagName: tag.tagName,
                    }));
                    setSelectedTags(mappedTags);
                }

                if (prod.productColors && prod.productColors.length > 0) {
                    const mappedColors = prod.productColors.map((pc: ProductColor) => {
                        const allVariantImages: string[] = pc.productImagesDto?.map(img => img.imageUrl) || [];

                        return {
                            productColorId: pc.productColorId,
                            colorId: pc.colorId,
                            lensId: pc.lensId || '',
                            packageLens: pc.packageLens || '',
                            noBgImgUrl: undefined,
                            noBgImgPreview: pc.noBgImgUrl,
                            productVariantImages: [],
                            productVariantImagePreviews: allVariantImages,
                            variants: pc.productVariants?.map((pv: ProductVariant) => ({
                                productVariantId: pv.productVariantId,
                                sizeId: pv.sizeId,
                                variantName: pv.variantName || '',
                                quantity: pv.quantity || 0,
                                imageUrl: undefined,
                                imagePreview: pv.imageUrl,
                                status: pv.status || 'Active',
                                productWeight: pv.productWeight,
                                productLength: pv.productLength,
                                productWidth: pv.productWidth,
                                productHeight: pv.productHeight,
                            })) || [],
                            colorName: pc.color?.colorName || '',
                            colorPrefix: pc.color?.colorPrefix || '',
                            hexCode: pc.color?.hexCode || '',
                        };
                    });
                    setProductColors(mappedColors);
                }
            }
            const [catRes, colRes, sizeRes, tagsRes] = await Promise.all([
                api.get('/category'),
                api.get('/color'),
                api.get('/size'),
                api.get('/tag'),
            ]);

            setCategories(catRes.data || []);
            setColors(colRes.data || []);
            setSizes(sizeRes.data || []);
            setAvailableTags(tagsRes.data || []);
        } catch (error: any) {
            console.error('Error fetching data:', error);
            messageToast.error('Không thể tải dữ liệu', error);
            //alert('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const updateBasicField = (field: string, value: any) => {
        switch (field) {
            case 'productName': setProductName(value); break;
            case 'description': setDescription(value); break;
            case 'price': setPrice(value); break;
            case 'categoryId': setCategoryId(value); break;
            case 'mainImageUrl':
                setMainImageFile(value);
                if (value) { setMainImagePreview(URL.createObjectURL(value)); }
                break;
        }
    };

    const handleUpdateTags = (tags: TagDto[]) => { setSelectedTags(tags); };

    const addProductColor = () => {
        setProductColors([
            ...productColors,
            {
                // Key fields for identifying a *new* color in update flow
                productColorId: undefined, // No existing ID
                colorId: undefined,        // Not linked to an existing color yet
                // Defaults for the modal
                colorName: '',
                colorPrefix: '',
                hexCode: '#FFFFFF',
                // Other fields
                lensId: '',
                packageLens: '',
                noBgImgUrl: undefined,
                noBgImgPreview: undefined,
                productVariantImages: [],
                productVariantImagePreviews: [],
                variants: [],
            },
        ]);
    };

    const removeProductColor = (index: number) => {
        setProductColors(productColors.filter((_, i) => i !== index));
    };

    const updateProductColor = (index: number, field: string, value: any) => {
        const updated = [...productColors];
        (updated[index] as any)[field] = value;
        // If selecting an existing color, clear the new color fields
        if (field === 'colorId' && value) {
            updated[index].colorName = '';
            updated[index].colorPrefix = '';
            updated[index].hexCode = '';
        }
        setProductColors(updated);
    };

    const addVariant = (colorIndex: number) => {
        const updated = [...productColors];
        if (!updated[colorIndex].variants) { updated[colorIndex].variants = []; }
        updated[colorIndex].variants!.push({
            sizeId: undefined, variantName: '', quantity: 0, imageUrl: undefined,
            imagePreview: undefined, status: 'Active', productWeight: 0.1,
            productLength: 15, productWidth: 10, productHeight: 0.2, sizeCode: ''
        });
        setProductColors(updated);
    };

    const removeVariant = (colorIndex: number, variantIndex: number) => {
        const updated = [...productColors];
        updated[colorIndex].variants = updated[colorIndex].variants!.filter((_, i) => i !== variantIndex);
        setProductColors(updated);
    };

    const updateVariant = (colorIndex: number, variantIndex: number, field: string, value: any) => {
        const updated = [...productColors];
        (updated[colorIndex].variants![variantIndex] as any)[field] = value;
        setProductColors(updated);
    };

    const formatNumber = (value: number | '') => {
        if (value === '') return '';
        return value.toLocaleString("vi-VN");
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\./g, '').replace(/,/g, '');
        const numericValue = raw === '' ? '' : parseFloat(raw);
        setPrice(numericValue);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        for (const [index, color] of productColors.entries()) {
            if (color.lensId && !color.packageLens) {
                messageToast.error(`Màu ${index + 1}: Nếu bạn cung cấp LensID, bạn cũng phải cung cấp PackageLens.`);
                return; // Dừng submit
            }
        }
        // **Frontend Validation for new colors (Optional but recommended)**
        const newColorEntries = productColors.filter(pc => !pc.colorId && pc.colorPrefix && pc.hexCode);
        const colorNames = newColorEntries.map(pc => pc.colorName?.toLowerCase());
        const prefixes = newColorEntries.map(pc => pc.colorPrefix?.toLowerCase());
        const hexCodes = newColorEntries.map(pc => pc.hexCode?.toLowerCase());
        const duplicateNames = colorNames.filter((n, index) => colorNames.indexOf(n) !== index);
        const duplicatePrefixes = prefixes.filter((p, index) => prefixes.indexOf(p) !== index);
        const duplicateHexCodes = hexCodes.filter((h, index) => hexCodes.indexOf(h) !== index);

        if (duplicateNames.length > 0 || duplicatePrefixes.length > 0 || duplicateHexCodes.length > 0) {
            let errorMsg = "Lỗi trùng lặp dữ liệu màu mới:\n";
            if (duplicateNames.length > 0) errorMsg += `- Names: ${duplicateNames.join(', ')}\n`;
            if (duplicatePrefixes.length > 0) errorMsg += `- Prefixes: ${duplicatePrefixes.join(', ')}\n`;
            if (duplicateHexCodes.length > 0) errorMsg += `- HexCodes: ${duplicateHexCodes.join(', ')}`;
            //alert(errorMsg);
            messageToast.error(errorMsg);
            return; // Stop submission
        }

        try {
            setSubmitting(true);
            const formData = convertUpdateToFormData(
                product, productName, description, price, categoryId,
                mainImageFile, productColors, selectedTags
            );
            const response = await api.put(`/product/${params.productId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (response.status === 200) {
                messageToast.success('Cập nhật sản phẩm thành công!');
                //alert('Cập nhật sản phẩm thành công!');
                router.push('/admin/product');
            } else {
                messageToast.error(response.data?.message || 'Cập nhật thất bại');
                //alert(response.data?.message || 'Cập nhật thất bại');
            }
        } catch (error: any) {
            console.error('Error updating product:', error);
            //alert('Có lỗi xảy ra khi cập nhật sản phẩm');
            messageToast.error('Có lỗi xảy ra khi cập nhật sản phẩm', error);
        } finally {
            setSubmitting(false);
        }
    };


    if (loading) return <LoadingSpinner />;

    // === Calculations for Validation Props ===
    // IDs of existing colors already selected in *other* color items
    const usedColorIds = productColors
        .map(pc => pc.colorId)
        .filter(id => id !== undefined && id !== 0) as number[];

    const existingNames = colors.map(c => c.colorName.toLowerCase());
    const existingPrefixes = colors.map(c => c.colorPrefix.toLowerCase());
    const existingHexCodes = colors.map(c => c.hexCode.toLowerCase());

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Cập nhật sản phẩm</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Cột trái */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Card: Thông Tin Chung */}
                        <div className="bg-white p-6 rounded-lg shadow">
                             {/* ... (Tên sản phẩm, Mô tả inputs) ... */}
                             <h2 className="text-xl font-semibold mb-4 text-gray-700">Thông Tin Chung</h2>
                             <div className="space-y-4">
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
                                     <input type="text" value={productName} onChange={(e) => updateBasicField("productName", e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                                 </div>
                                 <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label>
                                     <textarea value={description} onChange={(e) => updateBasicField("description", e.target.value)} rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                                 </div>
                             </div>
                        </div>
                        {/* Card: Tags */}
                        <UpdateTagsSection availableTags={availableTags} selectedTags={selectedTags} onUpdateTags={handleUpdateTags} />
                        {/* Section Màu Sắc & Biến Thể */}
                        <UpdateColorSection
                            productColors={productColors}
                            colors={colors}
                            sizes={sizes}
                            onAddColor={addProductColor}
                            onRemoveColor={removeProductColor}
                            onUpdateColor={updateProductColor}
                            onAddVariant={addVariant}
                            onRemoveVariant={removeVariant}
                            onUpdateVariant={updateVariant}
                            // --- Pass validation props down ---
                            usedColorIds={usedColorIds}
                            existingNames={existingNames}
                            existingPrefixes={existingPrefixes}
                            existingHexCodes={existingHexCodes}
                        />
                    </div>
                    {/* Cột phải */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Card: Ảnh Sản Phẩm Chính */}
                        <div className="bg-white p-6 rounded-lg shadow">
                             {/* ... (Image upload logic) ... */}
                            <h2 className="text-xl font-semibold mb-4 text-gray-700">Ảnh Sản Phẩm Chính *</h2>
                             <div>
                                 {mainImagePreview ? (
                                     <div className="mb-3 w-full aspect-square border rounded-lg overflow-hidden">
                                         <img src={mainImagePreview} alt="Main product" className="w-full h-full object-cover"/>
                                     </div>
                                 ) : (
                                     <div className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-3">
                                         <span className="text-gray-400">Chưa có ảnh</span>
                                     </div>
                                 )}
                                 <label className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600">
                                     <Upload size={20} />
                                     {mainImagePreview ? 'Đổi ảnh' : 'Tải ảnh lên'}
                                     <input type="file" accept="image/*" onChange={(e) => updateBasicField("mainImageUrl", e.target.files?.[0])} className="hidden"/>
                                 </label>
                             </div>
                        </div>
                        {/* Card: Danh Mục */}
                        <div className="bg-white p-6 rounded-lg shadow">
                             {/* ... (Category select) ... */}
                             <h2 className="text-xl font-semibold mb-4 text-gray-700">Danh Mục *</h2>
                             <select value={categoryId} onChange={(e) => updateBasicField("categoryId", e.target.value ? parseInt(e.target.value) : '')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                 <option value="">-- Chọn danh mục --</option>
                                 {categories.map((category) => (<option key={category.categoryId} value={category.categoryId}>{category.categoryName}</option>))}
                             </select>
                        </div>
                        {/* Card: Giá Sản Phẩm */}
                        <div className="bg-white p-6 rounded-lg shadow">
                             {/* ... (Price input) ... */}
                             <h2 className="text-xl font-semibold mb-4 text-gray-700">Giá Sản Phẩm *</h2>
                             <input type="text" inputMode="numeric" value={formatNumber(price)} onChange={handlePriceChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Nhập giá sản phẩm..."/>
                        </div>
                    </div>
                </div>
                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4 border-t">
                     {/* ... (Submit and Cancel buttons) ... */}
                    <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold">
                        {submitting ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
                    </button>
                    <button type="button" onClick={() => router.back()} className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 font-semibold">
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
}