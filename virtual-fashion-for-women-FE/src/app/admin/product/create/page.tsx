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
} from "@/models/RequestCreateProduct";
import {
    convertToFormData,
    validateProductForm,
    createEmptyProductColor,
} from "@/utils/productHelpers";
import BasicInfoSection from "@/components/ManageProduct/BasicInfoSection";
import ColorSection from "@/components/ManageProduct/ColorSection";
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
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState<string[]>([]);

    const [categories, setCategories] = useState<Category[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const [sizes, setSizes] = useState<Size[]>([]);
    const [loadingMasterData, setLoadingMasterData] = useState(true);

    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [categoriesRes, colorsRes, sizesRes] = await Promise.all([
                    api.get("/category"),
                    api.get("/color"),
                    api.get("/size"),
                ]);

                setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
                setColors(Array.isArray(colorsRes.data) ? colorsRes.data : []);
                setSizes(Array.isArray(sizesRes.data) ? sizesRes.data : []);

                console.log("Categories:", categoriesRes.data);
                console.log("Colors:", colorsRes.data);
                console.log("Sizes:", sizesRes.data);
            } catch (error) {
                console.error("Error fetching master data:", error);
            } finally {
                setLoadingMasterData(false);
            }
        };

        fetchMasterData();
    }, []);

    const updateBasicInfo = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const addColor = () => {
        setFormData({
            ...formData,
            productColor: [...formData.productColor, createEmptyProductColor()],
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
            productWeight: 0,
            productLength: 0,
            productWidth: 0,
            productHeight: 0,
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

    const handleSizeSelect = (colorIndex: number, variantIndex: number, sizeId: number) => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setErrors([]);

        const validation = validateProductForm(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            setLoading(false);
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
                setFormData({
                    productName: "",
                    description: "",
                    price: 0,
                    mainImageUrl: null,
                    categoryId: 0,
                    productColor: [],
                });
            } else {
                setMessage(`Lỗi: ${response.data.message || "Không thể tạo sản phẩm"}`);
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
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Tạo Sản Phẩm Mới</h1>

                <ErrorDisplay errors={errors} />

                <div className="space-y-6">
                    <BasicInfoSection
                        formData={{
                            productName: formData.productName,
                            description: formData.description,
                            price: formData.price,
                            categoryId: formData.categoryId,
                            mainImageUrl: formData.mainImageUrl,
                        }}
                        categories={categories}
                        onUpdate={updateBasicInfo}
                        onFileChange={(file) => updateBasicInfo("mainImageUrl", file)}
                    />

                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">Màu Sắc & Biến Thể</h2>
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
                                onUpdate={(field, value) => updateColor(colorIndex, field, value)}
                                onRemove={() => removeColor(colorIndex)}
                                onColorSelect={(colorId) => handleColorSelect(colorIndex, colorId)}
                                onAddVariant={() => addVariant(colorIndex)}
                                onRemoveVariant={(variantIndex) => removeVariant(colorIndex, variantIndex)}
                                onUpdateVariant={(variantIndex, field, value) =>
                                    updateVariant(colorIndex, variantIndex, field, value)
                                }
                                onSizeSelect={(variantIndex, sizeId) =>
                                    handleSizeSelect(colorIndex, variantIndex, sizeId)
                                }
                                onFileChange={(file, type, variantIndex) =>
                                    handleColorFileChange(colorIndex, file, type, variantIndex)
                                }
                                onMultipleImages={(files) => handleMultipleImages(colorIndex, files)}
                            />
                        ))}
                    </div>

                    <div className="flex items-center gap-4 pt-6 border-t">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? "Đang tạo..." : "Tạo sản phẩm"}
                        </button>

                        {message && (
                            <div
                                className={`text-sm font-medium ${
                                    message.includes("thành công") ? "text-green-600" : "text-red-600"
                                }`}
                            >
                                {message}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}