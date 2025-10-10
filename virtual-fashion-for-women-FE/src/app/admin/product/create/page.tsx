// src/app/admin/product/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Upload, X, AlertCircle } from "lucide-react";
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
    createEmptyVariant,
} from "@/utils/productHelpers";

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

    // Master data
    const [categories, setCategories] = useState<Category[]>([]);
    const [colors, setColors] = useState<Color[]>([]);
    const [sizes, setSizes] = useState<Size[]>([]);
    const [loadingMasterData, setLoadingMasterData] = useState(true);

    // Fetch master data
    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [categoriesRes, colorsRes, sizesRes] = await Promise.all([
                    api.get("/category"),
                    api.get("/color"),
                    api.get("/size"),
                ]);

                // Kiểm tra nếu response là array thì dùng luôn, nếu không thì là []
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

    // Handle color selection from dropdown
    const handleColorSelect = (colorIndex: number, colorId: number) => {
        const updatedColors = [...formData.productColor];
        if (colorId === 0) {
            // Create new color
            updatedColors[colorIndex] = {
                ...updatedColors[colorIndex],
                colorId: 0,
                colorName: "",
                colorPrefix: "",
                hexCode: "#ffffff",
            };
        } else {
            // Use existing color
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
        updatedColors[colorIndex].variants.push(createEmptyVariant());
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

    // Handle size selection from dropdown
    const handleSizeSelect = (colorIndex: number, variantIndex: number, sizeId: number) => {
        const updatedColors = [...formData.productColor];
        if (sizeId === 0) {
            // Create new size
            updatedColors[colorIndex].variants[variantIndex] = {
                ...updatedColors[colorIndex].variants[variantIndex],
                sizeId: 0,
                sizeCode: "",
            };
        } else {
            // Use existing size
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

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: string,
        colorIndex?: number,
        variantIndex?: number
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (type === "main") {
            setFormData({ ...formData, mainImageUrl: file });
        } else if (type === "noBg" && colorIndex !== undefined) {
            updateColor(colorIndex, "noBgImgUrl", file);
        } else if (type === "variant" && colorIndex !== undefined && variantIndex !== undefined) {
            updateVariant(colorIndex, variantIndex, "imageUrl", file);
        }
    };

    const handleMultipleImages = (
        e: React.ChangeEvent<HTMLInputElement>,
        colorIndex: number
    ) => {
        const files = Array.from(e.target.files || []);
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
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Tạo Sản Phẩm Mới</h1>

                {errors.length > 0 && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="text-red-600 mt-0.5" size={20} />
                            <div>
                                <h3 className="font-semibold text-red-800 mb-2">
                                    Vui lòng sửa các lỗi sau:
                                </h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {errors.map((error, index) => (
                                        <li key={index} className="text-sm text-red-700">
                                            {error}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="border-b pb-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Thông Tin Cơ Bản</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên sản phẩm *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.productName}
                                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label>
                                <textarea
                                    required
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá *</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) =>
                                            setFormData({ ...formData, price: parseFloat(e.target.value) })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Danh mục *
                                    </label>
                                    <select
                                        required
                                        value={formData.categoryId}
                                        onChange={(e) =>
                                            setFormData({ ...formData, categoryId: parseInt(e.target.value) })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value={0}>-- Chọn danh mục --</option>
                                        {categories.map((category) => (
                                            <option key={category.categoryId} value={category.categoryId}>
                                                {category.categoryName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ảnh chính *
                                </label>
                                <div className="flex items-center gap-3">
                                    <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600">
                                        <Upload size={20} />
                                        Chọn ảnh
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, "main")}
                                            className="hidden"
                                        />
                                    </label>
                                    {formData.mainImageUrl && (
                                        <span className="text-sm text-gray-600">{formData.mainImageUrl.name}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Colors */}
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
                            <div key={colorIndex} className="border rounded-lg p-4 mb-4 bg-gray-50">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-gray-700">Màu {colorIndex + 1}</h3>
                                    <button
                                        type="button"
                                        onClick={() => removeColor(colorIndex)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Color Selection Dropdown */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Chọn màu *
                                        </label>
                                        <select
                                            value={color.colorId}
                                            onChange={(e) => handleColorSelect(colorIndex, parseInt(e.target.value))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value={0}>-- Tạo màu mới --</option>
                                            {colors.map((c) => (
                                                <option key={c.colorId} value={c.colorId}>
                                                    {c.colorName} ({c.colorPrefix})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Show input fields if creating new color */}
                                    {color.colorId === 0 && (
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Tên màu *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={color.colorName}
                                                    onChange={(e) => updateColor(colorIndex, "colorName", e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Mã màu (Prefix) *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={color.colorPrefix}
                                                    onChange={(e) => updateColor(colorIndex, "colorPrefix", e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Hex Code *
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="color"
                                                        value={color.hexCode}
                                                        onChange={(e) => updateColor(colorIndex, "hexCode", e.target.value)}
                                                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={color.hexCode}
                                                        onChange={(e) => updateColor(colorIndex, "hexCode", e.target.value)}
                                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Lens ID (tùy chọn)
                                        </label>
                                        <input
                                            type="text"
                                            value={color.lensId}
                                            onChange={(e) => updateColor(colorIndex, "lensId", e.target.value)}
                                            placeholder="Nhập Lens ID nếu có"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ảnh không nền (tùy chọn)
                                        </label>
                                        <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 w-fit">
                                            <Upload size={20} />
                                            Chọn ảnh
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileChange(e, "noBg", colorIndex)}
                                                className="hidden"
                                            />
                                        </label>
                                        {color.noBgImgUrl && (
                                            <span className="text-sm text-gray-600 mt-2 block">
                                                {color.noBgImgUrl.name}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Ảnh biến thể (nhiều ảnh)
                                        </label>
                                        <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 w-fit">
                                            <Upload size={20} />
                                            Chọn nhiều ảnh
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={(e) => handleMultipleImages(e, colorIndex)}
                                                className="hidden"
                                            />
                                        </label>
                                        {color.productVariantImages.length > 0 && (
                                            <div className="text-sm text-gray-600 mt-2">
                                                {color.productVariantImages.length} ảnh đã chọn
                                            </div>
                                        )}
                                    </div>

                                    {/* Variants */}
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="font-semibold text-gray-700">Biến thể (Size)</h4>
                                            <button
                                                type="button"
                                                onClick={() => addVariant(colorIndex)}
                                                className="flex items-center gap-2 px-3 py-1 bg-indigo-500 text-white text-sm rounded hover:bg-indigo-600"
                                            >
                                                <Plus size={16} />
                                                Thêm size
                                            </button>
                                        </div>

                                        {color.variants.map((variant, variantIndex) => (
                                            <div key={variantIndex} className="border rounded p-3 mb-3 bg-white">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-sm font-medium text-gray-600">
                                                        Size {variantIndex + 1}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariant(colorIndex, variantIndex)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    {/* Size Selection Dropdown */}
                                                    <div className="col-span-2">
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Chọn size *
                                                        </label>
                                                        <select
                                                            value={variant.sizeId}
                                                            onChange={(e) =>
                                                                handleSizeSelect(colorIndex, variantIndex, parseInt(e.target.value))
                                                            }
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value={0}>-- Tạo size mới --</option>
                                                            {sizes.map((s) => (
                                                                <option key={s.sizeId} value={s.sizeId}>
                                                                    {s.sizeCode}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {/* Show input if creating new size */}
                                                    {variant.sizeId === 0 && (
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                Mã size *
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={variant.sizeCode}
                                                                onChange={(e) =>
                                                                    updateVariant(
                                                                        colorIndex,
                                                                        variantIndex,
                                                                        "sizeCode",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                            />
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Tên biến thể *
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={variant.variantName}
                                                            onChange={(e) =>
                                                                updateVariant(
                                                                    colorIndex,
                                                                    variantIndex,
                                                                    "variantName",
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Số lượng *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={variant.quantity}
                                                            onChange={(e) =>
                                                                updateVariant(
                                                                    colorIndex,
                                                                    variantIndex,
                                                                    "quantity",
                                                                    parseInt(e.target.value)
                                                                )
                                                            }
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Cân nặng (kg)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={variant.productWeight}
                                                            onChange={(e) =>
                                                                updateVariant(
                                                                    colorIndex,
                                                                    variantIndex,
                                                                    "productWeight",
                                                                    parseFloat(e.target.value)
                                                                )
                                                            }
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Chiều dài (cm)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={variant.productLength}
                                                            onChange={(e) =>
                                                                updateVariant(
                                                                    colorIndex,
                                                                    variantIndex,
                                                                    "productLength",
                                                                    parseFloat(e.target.value)
                                                                )
                                                            }
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Chiều rộng (cm)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={variant.productWidth}
                                                            onChange={(e) =>
                                                                updateVariant(
                                                                    colorIndex,
                                                                    variantIndex,
                                                                    "productWidth",
                                                                    parseFloat(e.target.value)
                                                                )
                                                            }
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Chiều cao (cm)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            step="0.1"
                                                            value={variant.productHeight}
                                                            onChange={(e) =>
                                                                updateVariant(
                                                                    colorIndex,
                                                                    variantIndex,
                                                                    "productHeight",
                                                                    parseFloat(e.target.value)
                                                                )
                                                            }
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </div>

                                                    <div className="col-span-2">
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Ảnh variant *
                                                        </label>
                                                        <label className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white text-sm rounded cursor-pointer hover:bg-blue-600 w-fit">
                                                            <Upload size={16} />
                                                            Chọn ảnh
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) =>
                                                                    handleFileChange(e, "variant", colorIndex, variantIndex)
                                                                }
                                                                className="hidden"
                                                            />
                                                        </label>
                                                        {variant.imageUrl && (
                                                            <span className="text-xs text-gray-600 mt-1 block">
                                                                {variant.imageUrl.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Submit Button */}
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
                                className={`text-sm font-medium ${message.includes("thành công") ? "text-green-600" : "text-red-600"
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