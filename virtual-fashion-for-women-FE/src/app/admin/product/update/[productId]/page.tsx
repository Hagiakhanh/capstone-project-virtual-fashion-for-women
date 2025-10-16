// src/app/admin/product/update/[productId]/page.tsx
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
import UpdateBasicInfoSection from '@/components/ManageProduct/UpdateBasicInfoSection';
import UpdateColorSection from '@/components/ManageProduct/UpdateColorSection';
import UpdateTagsSection from '@/components/ManageProduct/UpdateTagsSection';

interface UpdateProductPageProps {
    params: { productId: string };
}

export default function UpdateProductPage({ params }: UpdateProductPageProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Product data
    const [product, setProduct] = useState<Product | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const [sizes, setSizes] = useState<Size[]>([]);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);

    // Form fields
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState('');
    const [productColors, setProductColors] = useState<UpdateProductColorFormData[]>([]);
    const [selectedTags, setSelectedTags] = useState<TagDto[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch product details
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

                // Map existing tags
                if (prod.tags && prod.tags.length > 0) {
                    const mappedTags = prod.tags.map((tag: Tag) => ({
                        tagId: tag.tagId,
                        tagName: tag.tagName,
                    }));
                    setSelectedTags(mappedTags);
                }

                // Map existing product colors
                if (prod.productColors && prod.productColors.length > 0) {
                    const mappedColors = prod.productColors.map((pc: ProductColor) => {
                        const allVariantImages: string[] = pc.productImagesDto?.map(img => img.imageUrl) || [];

                        return {
                            productColorId: pc.productColorId,
                            colorId: pc.colorId,
                            lensId: pc.lensId || '',
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
                            colorName: '',
                            colorPrefix: '',
                            hexCode: '',
                        };
                    });
                    setProductColors(mappedColors);
                }
            }

            // Fetch categories, colors, sizes, tags
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
        } catch (error) {
            console.error('Error fetching data:', error);
            alert('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const updateBasicField = (field: string, value: any) => {
        switch (field) {
            case 'productName':
                setProductName(value);
                break;
            case 'description':
                setDescription(value);
                break;
            case 'price':
                setPrice(value);
                break;
            case 'categoryId':
                setCategoryId(value);
                break;
            case 'mainImageUrl':
                setMainImageFile(value);
                if (value) {
                    setMainImagePreview(URL.createObjectURL(value));
                }
                break;
        }
    };

    const handleUpdateTags = (tags: TagDto[]) => {
        setSelectedTags(tags);
    };

    const addProductColor = () => {
        setProductColors([
            ...productColors,
            {
                colorId: undefined,
                noBgImgUrl: undefined,
                lensId: '',
                productVariantImages: [],
                productVariantImagePreviews: [],
                variants: [],
                colorName: '',
                colorPrefix: '',
                hexCode: '',
            },
        ]);
    };

    const removeProductColor = (index: number) => {
        setProductColors(productColors.filter((_, i) => i !== index));
    };

    const updateProductColor = (index: number, field: string, value: any) => {
        const updated = [...productColors];
        (updated[index] as any)[field] = value;
        setProductColors(updated);
    };

    const addVariant = (colorIndex: number) => {
        const updated = [...productColors];
        if (!updated[colorIndex].variants) {
            updated[colorIndex].variants = [];
        }
        updated[colorIndex].variants!.push({
            sizeId: undefined,
            variantName: '',
            quantity: 0,
            imageUrl: undefined,
            imagePreview: undefined,
            status: 'Active',
            productWeight: 0.1,
            productLength: 15,
            productWidth: 10,
            productHeight: 0.2,
            sizeCode: '',
        });
        setProductColors(updated);
    };

    const removeVariant = (colorIndex: number, variantIndex: number) => {
        const updated = [...productColors];
        updated[colorIndex].variants = updated[colorIndex].variants!.filter(
            (_, i) => i !== variantIndex
        );
        setProductColors(updated);
    };

    const updateVariant = (
        colorIndex: number,
        variantIndex: number,
        field: string,
        value: any
    ) => {
        const updated = [...productColors];
        (updated[colorIndex].variants![variantIndex] as any)[field] = value;
        setProductColors(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSubmitting(true);

            const formData = convertUpdateToFormData(
                product,
                productName,
                description,
                price,
                categoryId,
                mainImageFile,
                productColors,
                selectedTags // Truyền tags vào
            );

            const response = await api.put(`/product/${params.productId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status === 200) {
                alert('Cập nhật sản phẩm thành công!');
                router.push('/admin/product');
            } else {
                alert(response.data?.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Error updating product:', error);
            alert('Có lỗi xảy ra khi cập nhật sản phẩm');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Cập nhật sản phẩm</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <UpdateBasicInfoSection
                    productName={productName}
                    description={description}
                    price={price}
                    categoryId={categoryId}
                    mainImagePreview={mainImagePreview}
                    categories={categories}
                    onUpdate={updateBasicField}
                />

                <UpdateTagsSection
                    availableTags={availableTags}
                    selectedTags={selectedTags}
                    onUpdateTags={handleUpdateTags}
                />

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
                />

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
                    >
                        {submitting ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
}