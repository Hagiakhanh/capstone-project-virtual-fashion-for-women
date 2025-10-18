// src/app/admin/product/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { api } from "@/api/instance";
import {
    CreateProductFormData,
    ApiResponse,
    Product,
    Category,
    Color,
    Size,
    Tag,
    ProductColorRequest,
} from "@/models/RequestCreateProduct";
import {
    convertToFormData,
    validateProductForm,
    createEmptyProductColor,
} from "@/utils/productHelpers";
import { messageToast } from "@/helpers/toastHelper";

// Import các component Card
import BasicInfoSection from "@/components/ManageProduct/BasicInfoSection";
import UploadImgCard from "@/components/ManageProduct/UploadImgCard";
import CategoryCard from "@/components/ManageProduct/CategoryCard";
// KHÔNG import AddCategoryModal nữa

import ColorSection from "@/components/ManageProduct/ColorSection";
import TagsSection from "@/components/ManageProduct/TagsSection";
import ErrorDisplay from "@/components/ManageProduct/ErrorDisplay";
import LoadingSpinner from "@/components/ManageProduct/LoadingSpinner";

export default function CreateProductPage() {
    const [formData, setFormData] = useState<CreateProductFormData>({
        productName: "",
        description: "",
        price: 0,
        mainImageUrl: null,
        categoryId: 0,
        productColor: [],
        existingTagIds: [],
        newTags: [],
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState<string[]>([]);

    const [categories, setCategories] = useState<Category[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const [sizes, setSizes] = useState<Size[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loadingMasterData, setLoadingMasterData] = useState(true);

    // KHÔNG CẦN state cho modal nữa

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [categoriesRes, colorsRes, sizesRes, tagsRes] = await Promise.all([
                api.get("/category"),
                api.get("/color"),
                api.get("/size"),
                api.get("/tag"),
                ]);

                setCategories(
                    Array.isArray(categoriesRes.data) ? categoriesRes.data : []
                );
                setColors(Array.isArray(colorsRes.data) ? colorsRes.data : []);
                setSizes(Array.isArray(sizesRes.data) ? sizesRes.data : []);
                setTags(Array.isArray(tagsRes.data) ? tagsRes.data : []);
            } catch (error) {
                console.error("Error fetching master data:", error);
            } finally {
                setLoadingMasterData(false);
            }
        };

        fetchMasterData();
    }, []);

    // ... (Tất cả logic handlers của bạn (updateBasicInfo, tags, colors, variants)
    // ... VẪN GIỮ NGUYÊN NHƯ CŨ ...)
    const updateBasicInfo = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    // Tag handlers
    const handleSelectTag = (tagId: number) => {
        if (!formData.existingTagIds.includes(tagId)) {
            setFormData({
                ...formData,
                existingTagIds: [...formData.existingTagIds, tagId],
            });
        }
    };

    const handleRemoveTag = (tagId: number) => {
        setFormData({
            ...formData,
            existingTagIds: formData.existingTagIds.filter((id) => id !== tagId),
        });
    };

    const handleAddNewTag = (tagName: string) => {
        if (!formData.newTags.includes(tagName)) {
            setFormData({
                ...formData,
                newTags: [...formData.newTags, tagName],
            });
        }
    };

    const handleRemoveNewTag = (index: number) => {
        setFormData({
            ...formData,
            newTags: formData.newTags.filter((_, i) => i !== index),
        });
    };

    const addColor = () => {
        setFormData({
            ...formData,
            productColor: [...formData.productColor, createEmptyProductColor() as ProductColorRequest],
        });
    };

    const removeColor = (colorIndex: number) => {
        setFormData({
            ...formData,
            productColor: formData.productColor.filter((_, i) => i !== colorIndex),
        });
    };

    const updateColor = (colorIndex: number, field: string, value: any) => {
        const updatedColors = [...formData.productColor];
        updatedColors[colorIndex] = {
            ...updatedColors[colorIndex],
            [field]: value,
        };
        setFormData({ ...formData, productColor: updatedColors });
    };

    const handleColorSelect = (colorIndex: number, colorId: number) => {
        const updatedColors = [...formData.productColor];
        if (colorId === 0) {
            updatedColors[colorIndex] = {
                ...updatedColors[colorIndex],
                colorId: 0,
                colorName: "",
                colorPrefix: "",
                hexCode: "#ffffff",
            };
        } else {
            const selectedColor = colors.find((c) => c.colorId === colorId);
            if (selectedColor) {
                updatedColors[colorIndex] = {
                ...updatedColors[colorIndex],
                colorId: selectedColor.colorId,
                colorName: selectedColor.colorName,
                colorPrefix: selectedColor.colorPrefix,
                hexCode: selectedColor.hexCode,
                };
            }
        }
        setFormData({ ...formData, productColor: updatedColors });
    };

    const addVariant = (colorIndex: number) => {
        const updatedColors = [...formData.productColor];
        updatedColors[colorIndex].variants.push({
            sizeId: 0,
            sizeCode: "",
            variantName: "",
            quantity: 0,
            productWeight: 0.1,
            productLength: 15,
            productWidth: 10,
            productHeight: 0.2,
            imageUrl: null,
        });
        setFormData({ ...formData, productColor: updatedColors });
    };

    const removeVariant = (colorIndex: number, variantIndex: number) => {
        const updatedColors = [...formData.productColor];
        updatedColors[colorIndex].variants = updatedColors[colorIndex].variants.filter(
            (_, i) => i !== variantIndex
        );
        setFormData({ ...formData, productColor: updatedColors });
    };

    const updateVariant = (
        colorIndex: number,
        variantIndex: number,
        field: string,
        value: any
    ) => {
        const updatedColors = [...formData.productColor];
        updatedColors[colorIndex].variants[variantIndex] = {
            ...updatedColors[colorIndex].variants[variantIndex],
            [field]: value,
        };
        setFormData({ ...formData, productColor: updatedColors });
    };

    const handleSizeSelect = (
        colorIndex: number,
        variantIndex: number,
        sizeId: number
    ) => {
        const updatedColors = [...formData.productColor];
        if (sizeId === 0) {
            updatedColors[colorIndex].variants[variantIndex] = {
                ...updatedColors[colorIndex].variants[variantIndex],
                sizeId: 0,
                sizeCode: "",
            };
        } else {
            const selectedSize = sizes.find((s) => s.sizeId === sizeId);
            if (selectedSize) {
                updatedColors[colorIndex].variants[variantIndex] = {
                ...updatedColors[colorIndex].variants[variantIndex],
                sizeId: selectedSize.sizeId,
                sizeCode: selectedSize.sizeCode,
                };
            }
        }
        setFormData({ ...formData, productColor: updatedColors });
    };

    const handleColorFileChange = (
        colorIndex: number,
        file: File,
        type: "noBg" | "variant",
        variantIndex?: number
    ) => {
        if (type === "noBg") {
            updateColor(colorIndex, "noBgImgUrl", file);
        } else if (type === "variant" && variantIndex !== undefined) {
            updateVariant(colorIndex, variantIndex, "imageUrl", file);
        }
    };

    const handleMultipleImages = (colorIndex: number, files: File[]) => {
        updateColor(colorIndex, "productVariantImages", files);
    };
    // Kết thúc handlers

    // KHÔNG CẦN handler cho modal

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setErrors([]);

        const validation = validateProductForm(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            setLoading(false);
            window.scrollTo(0, 0); // Cuộn lên đầu để thấy lỗi
            return;
        }

        try {
            const formDataToSend = convertToFormData(formData);

            const response = await api.post<ApiResponse<Product>>(
                "/product",
                formDataToSend,
                {
                headers: { "Content-Type": "multipart/form-data" },
                }
            );

            if (response.status === 200 || response.status === 201) {
                setMessage("Tạo sản phẩm thành công!");
                setErrors([]);
                setFormData({
                    productName: "",
                    description: "",
                    price: 0,
                    mainImageUrl: null,
                    categoryId: 0,
                    productColor: [],
                    existingTagIds: [],
                    newTags: [],
                });
            } else {
                setMessage(
                    `Lỗi: ${response.data.message || "Không thể tạo sản phẩm"}`
                );
            }
        } catch (error: any) {
            console.error("Error creating product:", error);
            setMessage(`Lỗi: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (loadingMasterData) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
                {/* Header với các nút bấm */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                        Thêm Sản Phẩm Mới
                    </h1>
                    <div className="flex gap-2 md:gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-3 py-2 text-sm md:px-4 md:py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 disabled:bg-gray-400"
                        >
                            {loading ? "Đang tạo..." : "Thêm Sản Phẩm"}
                        </button>
                    </div>
                </div>

                {/* Hiển thị lỗi và thông báo */}
                <ErrorDisplay errors={errors} />
                {message && (
                    <div
                        className={`text-sm font-medium mb-4 p-3 rounded-lg ${
                        message.includes("thành công")
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                    >
                        {message}
                    </div>
                )}

                {/* Layout 2 cột */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cột trái */}
                    <div className="lg:col-span-2 space-y-6">
                        <BasicInfoSection
                            formData={{
                                productName: formData.productName,
                                description: formData.description,
                            }}
                            onUpdate={updateBasicInfo}
                        />

                        <TagsSection
                            availableTags={tags}
                            selectedTagIds={formData.existingTagIds}
                            newTags={formData.newTags}
                            onSelectTag={handleSelectTag}
                            onRemoveTag={handleRemoveTag}
                            onAddNewTag={handleAddNewTag}
                            onRemoveNewTag={handleRemoveNewTag}
                        />

                        {/* Card Màu Sắc & Biến Thể */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-700">
                                    Màu Sắc & Biến Thể
                                </h2>
                                <button
                                    type="button"
                                    onClick={addColor}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                >
                                <Plus size={20} />
                                    Thêm màu
                                </button>
                            </div>

                            {formData.productColor.map((color, colorIndex) => (
                                <ColorSection
                                    key={colorIndex}
                                    color={color}
                                    colorIndex={colorIndex}
                                    colors={colors}
                                    sizes={sizes}
                                    onUpdate={(field, value) =>
                                        updateColor(colorIndex, field, value)
                                    }
                                    onRemove={() => removeColor(colorIndex)}
                                    onColorSelect={(colorId) =>
                                        handleColorSelect(colorIndex, colorId)
                                    }
                                    onAddVariant={() => addVariant(colorIndex)}
                                    onRemoveVariant={(variantIndex) =>
                                        removeVariant(colorIndex, variantIndex)
                                    }
                                    onUpdateVariant={(variantIndex, field, value) =>
                                        updateVariant(colorIndex, variantIndex, field, value)
                                    }
                                    onSizeSelect={(variantIndex, sizeId) =>
                                        handleSizeSelect(colorIndex, variantIndex, sizeId)
                                    }
                                    onFileChange={(file, type, variantIndex) =>
                                        handleColorFileChange(colorIndex, file, type, variantIndex)
                                    }
                                    onMultipleImages={(files) =>
                                        handleMultipleImages(colorIndex, files)
                                    }
                                />
                            ))}
                        </div>
                    </div>

                    {/* Cột phải */}
                    <div className="lg:col-span-1 space-y-6">
                        <UploadImgCard
                            mainImageUrl={formData.mainImageUrl}
                            onFileChange={(file) => updateBasicInfo("mainImageUrl", file)}
                        />
                        <CategoryCard
                            categoryId={formData.categoryId}
                            categories={categories}
                            onUpdate={updateBasicInfo}
                        // KHÔNG CẦN onAddCategoryClick
                        />

                        {/* Card Giá */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-700">
                                Giá Sản Phẩm
                            </h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá cơ bản *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.price.toLocaleString("vi-VN")}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/\D/g, ""); // bỏ ký tự không phải số
                                        updateBasicInfo("price", Number(rawValue));
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>

        {/* KHÔNG CẦN AddCategoryModal */}
        </div>
    );
}